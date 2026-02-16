import { buildInitialCells, gridReducer } from '../../src/state/gridReducer.js';

function stripCellMeta(cells) {
  const cleaned = {};
  for (const [key, cell] of Object.entries(cells)) {
    const { id, row, col, ...rest } = cell;
    cleaned[key] = rest;
  }
  return cleaned;
}

export function createDocument(rows, cols) {
  const cells = stripCellMeta(buildInitialCells(rows, cols));
  return {
    version: 1,
    gridSize: { rows, cols },
    frames: [{ id: 0, cells }],
    bgColor: '#1a1a24',
  };
}

export function documentToState(doc) {
  const activeFrameIndex = doc.activeFrameIndex || 0;
  const frames = doc.frames.map(f => {
    const cells = {};
    for (const [key, cell] of Object.entries(f.cells)) {
      const [row, col] = key.split('-').map(Number);
      cells[key] = { id: key, row, col, ...cell };
    }
    return { ...f, cells };
  });

  let nextFrameId = doc.nextFrameId;
  if (nextFrameId == null) {
    nextFrameId = Math.max(...frames.map(f => f.id)) + 1;
  }

  return {
    gridSize: doc.gridSize,
    frames,
    activeFrameIndex,
    nextFrameId,
    cells: frames[activeFrameIndex].cells,
    selectedCellIds: [],
    lastSelectedId: null,
    onionSkin: { enabled: false, prevCount: 1, nextCount: 0, opacity: 0.2 },
    bgColor: doc.bgColor || '#1a1a24',
  };
}

export function stateToDocument(state) {
  const frames = state.frames.map(f => {
    const cells = {};
    for (const [key, cell] of Object.entries(f.cells)) {
      const { id, row, col, ...rest } = cell;
      cells[key] = rest;
    }
    return { id: f.id, cells };
  });

  const doc = {
    version: 1,
    gridSize: state.gridSize,
    frames,
    bgColor: state.bgColor,
  };
  if (state.activeFrameIndex > 0) {
    doc.activeFrameIndex = state.activeFrameIndex;
  }
  return doc;
}

export function dispatch(document, action) {
  const state = documentToState(document);
  const newState = gridReducer(state, action);
  return stateToDocument(newState);
}

export function dispatchMany(document, actions) {
  let state = documentToState(document);
  for (const action of actions) {
    state = gridReducer(state, action);
  }
  return stateToDocument(state);
}
