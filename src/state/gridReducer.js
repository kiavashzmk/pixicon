import { DEFAULT_CELL } from '../constants.js';

function createCell(row, col, overrides = {}) {
  return {
    id: `${row}-${col}`,
    row,
    col,
    ...DEFAULT_CELL,
    ...overrides,
  };
}

export function buildInitialCells(rows, cols) {
  const cells = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r}-${c}`;
      cells[key] = createCell(r, c);
    }
  }
  return cells;
}

function withDerivedCells(state) {
  return {
    ...state,
    cells: state.frames[state.activeFrameIndex].cells,
  };
}

function updateActiveFrame(state, cellsUpdater) {
  const frames = [...state.frames];
  const frame = { ...frames[state.activeFrameIndex] };
  const cells = { ...frame.cells };
  cellsUpdater(cells);
  frame.cells = cells;
  frames[state.activeFrameIndex] = frame;
  return withDerivedCells({ ...state, frames });
}

const initialCells = buildInitialCells(8, 8);

export const initialState = {
  gridSize: { rows: 8, cols: 8 },
  frames: [{ id: 0, cells: initialCells }],
  activeFrameIndex: 0,
  nextFrameId: 1,
  cells: initialCells,
  selectedCellIds: [],
  lastSelectedId: null,
  onionSkin: { enabled: false, prevCount: 1, nextCount: 0, opacity: 0.2 },
  bgColor: '#1a1a24',
};

export function gridReducer(state, action) {
  switch (action.type) {
    case 'SET_GRID_SIZE': {
      const { rows, cols } = action.payload;
      const frames = state.frames.map(frame => {
        const cells = {};
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const key = `${r}-${c}`;
            cells[key] = frame.cells[key] || createCell(r, c);
          }
        }
        return { ...frame, cells };
      });
      return withDerivedCells({
        ...state,
        gridSize: { rows, cols },
        frames,
        selectedCellIds: state.selectedCellIds.filter((id) => frames[state.activeFrameIndex].cells[id]),
      });
    }

    case 'TOGGLE_CELL': {
      const { id } = action.payload;
      const cell = state.cells[id];
      if (!cell) return state;
      return updateActiveFrame(state, (cells) => {
        cells[id] = { ...cells[id], active: !cells[id].active };
      });
    }

    case 'PAINT_CELL': {
      const { id, fill } = action.payload;
      const cell = state.cells[id];
      if (!cell) return state;
      return updateActiveFrame(state, (cells) => {
        cells[id] = { ...cells[id], active: true, fill };
      });
    }

    case 'SELECT_CELL': {
      const { id, shift, meta } = action.payload;
      if (meta) {
        const selected = state.selectedCellIds.includes(id)
          ? state.selectedCellIds.filter(sid => sid !== id)
          : [...state.selectedCellIds, id];
        return { ...state, selectedCellIds: selected, lastSelectedId: id };
      }
      if (shift && state.lastSelectedId) {
        const [r1, c1] = state.lastSelectedId.split('-').map(Number);
        const [r2, c2] = id.split('-').map(Number);
        const minR = Math.min(r1, r2);
        const maxR = Math.max(r1, r2);
        const minC = Math.min(c1, c2);
        const maxC = Math.max(c1, c2);
        const rangeIds = [];
        for (let r = minR; r <= maxR; r++) {
          for (let c = minC; c <= maxC; c++) {
            rangeIds.push(`${r}-${c}`);
          }
        }
        return { ...state, selectedCellIds: rangeIds };
      }
      return { ...state, selectedCellIds: [id], lastSelectedId: id };
    }

    case 'SELECT_RANGE': {
      const { ids, anchorId } = action.payload;
      return { ...state, selectedCellIds: ids, lastSelectedId: anchorId };
    }

    case 'DESELECT_ALL': {
      return { ...state, selectedCellIds: [], lastSelectedId: null };
    }

    case 'UPDATE_CELL_PROPS': {
      const { ids, props } = action.payload;
      return updateActiveFrame(state, (cells) => {
        for (const id of ids) {
          if (cells[id]) {
            cells[id] = { ...cells[id], ...props };
          }
        }
      });
    }

    case 'APPLY_ANIMATION_TYPE': {
      const { ids, animationType } = action.payload;
      return updateActiveFrame(state, (cells) => {
        for (const id of ids) {
          if (cells[id]) {
            cells[id] = { ...cells[id], animationType };
          }
        }
      });
    }

    case 'LOAD_PRESET': {
      const { cells: presetCells, gridSize } = action.payload;
      const size = gridSize || state.gridSize;
      const cells = {};
      for (let r = 0; r < size.rows; r++) {
        for (let c = 0; c < size.cols; c++) {
          const key = `${r}-${c}`;
          cells[key] = presetCells[key]
            ? { direction: 'normal', iterationCount: 'infinite', fillMode: 'none', ...presetCells[key] }
            : createCell(r, c);
        }
      }
      const frames = [{ id: 0, cells }];
      return withDerivedCells({
        ...state,
        gridSize: size,
        frames,
        activeFrameIndex: 0,
        nextFrameId: 1,
        selectedCellIds: [],
        lastSelectedId: null,
      });
    }

    case 'APPLY_PRESET_ANIMATION': {
      const { cells: presetCells, gridSize: presetSize } = action.payload;
      const pRows = presetSize ? presetSize.rows : 8;
      const pCols = presetSize ? presetSize.cols : 8;
      const curRows = state.gridSize.rows;
      const curCols = state.gridSize.cols;

      const ANIMATION_PROPS = [
        'animationType', 'duration', 'delay', 'easing',
        'opacity', 'scale', 'direction', 'iterationCount', 'fillMode',
      ];

      return updateActiveFrame(state, (cells) => {
        for (const [presetKey, presetCell] of Object.entries(presetCells)) {
          if (!presetCell.active) continue;
          const [pr, pc] = presetKey.split('-').map(Number);

          const scaleR = curRows / pRows;
          const scaleC = curCols / pCols;
          const startR = Math.floor(pr * scaleR);
          const endR = Math.floor((pr + 1) * scaleR);
          const startC = Math.floor(pc * scaleC);
          const endC = Math.floor((pc + 1) * scaleC);

          for (let r = startR; r < endR; r++) {
            for (let c = startC; c < endC; c++) {
              const key = `${r}-${c}`;
              if (cells[key] && cells[key].active) {
                const animProps = {};
                for (const prop of ANIMATION_PROPS) {
                  if (presetCell[prop] !== undefined) {
                    animProps[prop] = presetCell[prop];
                  }
                }
                cells[key] = { ...cells[key], ...animProps };
              }
            }
          }
        }
      });
    }

    case 'CLEAR_ALL': {
      const cells = buildInitialCells(state.gridSize.rows, state.gridSize.cols);
      const frames = [{ id: 0, cells }];
      return withDerivedCells({
        ...state,
        frames,
        activeFrameIndex: 0,
        nextFrameId: 1,
        selectedCellIds: [],
        lastSelectedId: null,
      });
    }

    case 'DEACTIVATE_CELLS': {
      const { ids } = action.payload;
      return {
        ...updateActiveFrame(state, (cells) => {
          for (const id of ids) {
            if (cells[id]) {
              cells[id] = { ...cells[id], active: false, animationType: 'none' };
            }
          }
        }),
        selectedCellIds: [],
      };
    }

    case 'ADD_FRAME': {
      const newCells = buildInitialCells(state.gridSize.rows, state.gridSize.cols);
      const newFrame = { id: state.nextFrameId, cells: newCells };
      const frames = [...state.frames, newFrame];
      return withDerivedCells({
        ...state,
        frames,
        activeFrameIndex: frames.length - 1,
        nextFrameId: state.nextFrameId + 1,
      });
    }

    case 'DUPLICATE_FRAME': {
      const sourceFrame = state.frames[state.activeFrameIndex];
      const clonedCells = {};
      for (const [key, cell] of Object.entries(sourceFrame.cells)) {
        clonedCells[key] = { ...cell };
      }
      const newFrame = { id: state.nextFrameId, cells: clonedCells };
      const frames = [...state.frames];
      frames.splice(state.activeFrameIndex + 1, 0, newFrame);
      return withDerivedCells({
        ...state,
        frames,
        activeFrameIndex: state.activeFrameIndex + 1,
        nextFrameId: state.nextFrameId + 1,
      });
    }

    case 'REMOVE_FRAME': {
      if (state.frames.length <= 1) return state;
      const frames = state.frames.filter((_, i) => i !== state.activeFrameIndex);
      const activeFrameIndex = Math.min(state.activeFrameIndex, frames.length - 1);
      return withDerivedCells({
        ...state,
        frames,
        activeFrameIndex,
      });
    }

    case 'SET_ACTIVE_FRAME': {
      let { index } = action.payload;
      if (index === -1) {
        // Next frame, wrap around
        index = (state.activeFrameIndex + 1) % state.frames.length;
      }
      if (index < 0 || index >= state.frames.length) return state;
      return withDerivedCells({
        ...state,
        activeFrameIndex: index,
      });
    }

    case 'APPLY_STAGGER': {
      const { delays } = action.payload;
      return updateActiveFrame(state, (cells) => {
        for (const [id, delay] of Object.entries(delays)) {
          if (cells[id]) cells[id] = { ...cells[id], delay };
        }
      });
    }

    case 'SET_ONION_SKIN': {
      return { ...state, onionSkin: { ...state.onionSkin, ...action.payload } };
    }

    case 'SET_BG_COLOR': {
      return { ...state, bgColor: action.payload };
    }

    default:
      return state;
  }
}
