import { useCallback, useRef, useEffect } from 'react';
import { useGrid, useGridDispatch } from '../state/GridContext.jsx';
import GridCell from './GridCell.jsx';
import './GridCanvas.css';

function getCellIdFromPoint(x, y) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  const cellEl = el.closest('[data-cell-id]');
  return cellEl ? cellEl.dataset.cellId : null;
}

function computeRangeIds(id1, id2) {
  const [r1, c1] = id1.split('-').map(Number);
  const [r2, c2] = id2.split('-').map(Number);
  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);
  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);
  const ids = [];
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      ids.push(`${r}-${c}`);
    }
  }
  return ids;
}

export default function GridCanvas() {
  const { gridSize, cells, selectedCellIds, frames, activeFrameIndex, onionSkin, bgColor } = useGrid();
  const dispatch = useGridDispatch();

  const dragRef = useRef({
    active: false,
    startId: null,
    currentId: null,
    mouseDownFired: false,
    suppressClick: false,
  });

  const handleToggle = useCallback((id) => {
    dispatch({ type: 'TOGGLE_CELL', payload: { id } });
  }, [dispatch]);

  const handleSelect = useCallback((id, { shift, meta }) => {
    dispatch({ type: 'SELECT_CELL', payload: { id, shift, meta } });
  }, [dispatch]);

  const handleDeselect = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' });
  }, [dispatch]);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0 || e.shiftKey || e.metaKey) return;
    const cellId = getCellIdFromPoint(e.clientX, e.clientY);
    if (!cellId) return;
    e.preventDefault();
    dragRef.current.mouseDownFired = true;
    dragRef.current.startId = cellId;
    dragRef.current.currentId = cellId;
    dragRef.current.active = false;
  }, []);

  useEffect(() => {
    function handleMouseMove(e) {
      const drag = dragRef.current;
      if (!drag.mouseDownFired) return;
      const cellId = getCellIdFromPoint(e.clientX, e.clientY);
      if (!cellId || cellId === drag.currentId) return;
      if (cellId !== drag.startId) {
        drag.active = true;
      }
      drag.currentId = cellId;
      const ids = computeRangeIds(drag.startId, cellId);
      dispatch({ type: 'SELECT_RANGE', payload: { ids, anchorId: drag.startId } });
    }

    function handleMouseUp() {
      const drag = dragRef.current;
      if (!drag.mouseDownFired) return;
      if (drag.active) {
        drag.suppressClick = true;
        const ids = computeRangeIds(drag.startId, drag.currentId);
        dispatch({ type: 'SELECT_RANGE', payload: { ids, anchorId: drag.startId } });
      }
      drag.mouseDownFired = false;
      drag.active = false;
      drag.startId = null;
      drag.currentId = null;
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dispatch]);

  const handleClickCapture = useCallback((e) => {
    if (dragRef.current.suppressClick) {
      e.stopPropagation();
      dragRef.current.suppressClick = false;
    }
  }, []);

  // Onion skin ghost cells
  const ghostCells = [];
  if (onionSkin && onionSkin.enabled && frames.length > 1) {
    const renderGhosts = (frameIndex, offset, type) => {
      const frame = frames[frameIndex];
      if (!frame) return;
      const fadedOpacity = onionSkin.opacity / offset;
      for (const cell of Object.values(frame.cells)) {
        if (!cell.active) continue;
        ghostCells.push(
          <div
            key={`ghost-${type}-${offset}-${cell.id}`}
            className={`grid-cell-ghost ${type}`}
            style={{
              gridRow: cell.row + 2,
              gridColumn: cell.col + 2,
              backgroundColor: cell.fill,
              opacity: fadedOpacity,
              pointerEvents: 'none',
            }}
          />
        );
      }
    };

    for (let i = 1; i <= onionSkin.prevCount; i++) {
      const idx = activeFrameIndex - i;
      if (idx >= 0) renderGhosts(idx, i, 'prev');
    }
    for (let i = 1; i <= onionSkin.nextCount; i++) {
      const idx = activeFrameIndex + i;
      if (idx < frames.length) renderGhosts(idx, i, 'next');
    }
  }

  const gridChildren = [];

  // Corner cell (row 1, col 1 of the CSS grid)
  gridChildren.push(<span key="corner" className="grid-axis-label" />);

  // Column labels across the top
  for (let c = 0; c < gridSize.cols; c++) {
    gridChildren.push(
      <span key={`col-${c}`} className="grid-axis-label">{c + 1}</span>
    );
  }

  // Rows: each row starts with a row label, then the cells
  for (let r = 0; r < gridSize.rows; r++) {
    gridChildren.push(
      <span key={`row-${r}`} className="grid-axis-label">{r + 1}</span>
    );
    for (let c = 0; c < gridSize.cols; c++) {
      const key = `${r}-${c}`;
      gridChildren.push(
        <GridCell
          key={key}
          cell={cells[key]}
          isSelected={selectedCellIds.includes(key)}
          onToggle={handleToggle}
          onSelect={handleSelect}
        />
      );
    }
  }

  return (
    <div className="grid-canvas-wrapper" onClick={handleDeselect}>
      <div
        className="grid-canvas"
        style={{
          gridTemplateColumns: `auto repeat(${gridSize.cols}, 1fr)`,
          gridTemplateRows: `auto repeat(${gridSize.rows}, 1fr)`,
          background: bgColor,
        }}
        onMouseDown={handleMouseDown}
        onClickCapture={handleClickCapture}
      >
        {ghostCells}
        {gridChildren}
      </div>
    </div>
  );
}
