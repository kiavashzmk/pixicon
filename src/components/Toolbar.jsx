import { useState } from 'react';
import { useGrid, useGridDispatch } from '../state/GridContext.jsx';
import { GRID_SIZE_OPTIONS } from '../constants.js';
import { PRESETS } from '../utils/presets.js';
import ExportModal from './ExportModal.jsx';
import ImportModal from './ImportModal.jsx';
import './Toolbar.css';

export default function Toolbar() {
  const { canUndo, canRedo, bgColor, cells } = useGrid();
  const dispatch = useGridDispatch();
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  function handleGridSize(e) {
    const opt = GRID_SIZE_OPTIONS[e.target.value];
    dispatch({ type: 'SET_GRID_SIZE', payload: opt });
  }

  function handlePreset(preset) {
    const data = preset.fn();
    const hasActiveCells = Object.values(cells).some(c => c.active);
    if (hasActiveCells) {
      dispatch({ type: 'APPLY_PRESET_ANIMATION', payload: data });
    } else {
      dispatch({ type: 'LOAD_PRESET', payload: data });
    }
  }

  function handleClear() {
    dispatch({ type: 'CLEAR_ALL' });
  }

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          <select
            className="toolbar-select"
            defaultValue={0}
            onChange={handleGridSize}
          >
            {GRID_SIZE_OPTIONS.map((opt, i) => (
              <option key={opt.label} value={i}>{opt.label}</option>
            ))}
          </select>

          <div className="toolbar-divider" />

          <button
            className="toolbar-btn"
            disabled={!canUndo}
            onClick={() => dispatch({ type: 'UNDO' })}
            title="Undo (Cmd+Z)"
          >
            Undo
          </button>
          <button
            className="toolbar-btn"
            disabled={!canRedo}
            onClick={() => dispatch({ type: 'REDO' })}
            title="Redo (Cmd+Shift+Z)"
          >
            Redo
          </button>

          <div className="toolbar-divider" />

          <div className="toolbar-presets">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                className="toolbar-preset-btn"
                onClick={() => handlePreset(p)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="toolbar-right">
          <label className="toolbar-bg-color">
            <span className="toolbar-bg-label">BG</span>
            <input
              type="color"
              className="toolbar-color-input"
              value={bgColor}
              onChange={(e) => dispatch({ type: 'SET_BG_COLOR', payload: e.target.value })}
            />
          </label>
          <button className="toolbar-btn" onClick={() => setShowImport(true)}>
            Import
          </button>
          <button className="toolbar-btn danger" onClick={handleClear}>
            Clear All
          </button>
          <button className="toolbar-btn primary" onClick={() => setShowExport(true)}>
            Export
          </button>
        </div>
      </div>

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} />}
    </>
  );
}
