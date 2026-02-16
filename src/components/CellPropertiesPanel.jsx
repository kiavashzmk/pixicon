import { useState } from 'react';
import { useGrid, useGridDispatch } from '../state/GridContext.jsx';
import {
  ANIMATION_TYPES, ANIMATION_TYPE_LABELS,
  EASING_OPTIONS, EASING_LABELS,
  ANIMATION_DIRECTIONS, ANIMATION_FILL_MODES,
  STAGGER_PATTERNS, STAGGER_PATTERN_LABELS,
} from '../constants.js';
import { calculateStaggerDelays } from '../utils/staggerPatterns.js';
import ColorPicker from './ColorPicker.jsx';
import './CellPropertiesPanel.css';

export default function CellPropertiesPanel() {
  const { cells, selectedCellIds } = useGrid();
  const dispatch = useGridDispatch();
  const [staggerPattern, setStaggerPattern] = useState('left-to-right');
  const [staggerTime, setStaggerTime] = useState(1.0);

  if (selectedCellIds.length === 0) {
    return (
      <div className="cell-props-panel">
        <h3 className="panel-title">Cell Properties</h3>
        <p className="panel-empty">Select a cell to edit its properties</p>
      </div>
    );
  }

  const firstCell = cells[selectedCellIds[0]];
  const multi = selectedCellIds.length > 1;

  function updateProps(props) {
    dispatch({
      type: 'UPDATE_CELL_PROPS',
      payload: { ids: selectedCellIds, props },
    });
  }

  function setAnimationType(animationType) {
    dispatch({
      type: 'APPLY_ANIMATION_TYPE',
      payload: { ids: selectedCellIds, animationType },
    });
  }

  function applyStagger() {
    const selectedCells = {};
    for (const id of selectedCellIds) {
      if (cells[id]) selectedCells[id] = cells[id];
    }
    const delays = calculateStaggerDelays(selectedCells, staggerPattern, staggerTime);
    dispatch({ type: 'APPLY_STAGGER', payload: { delays } });
  }

  const isInfinite = (firstCell.iterationCount || 'infinite') === 'infinite';

  return (
    <div className="cell-props-panel">
      <h3 className="panel-title">
        Cell Properties
        {multi && <span className="multi-badge">{selectedCellIds.length} selected</span>}
      </h3>

      <div className="prop-group">
        <label className="prop-label">Color</label>
        <ColorPicker
          value={firstCell.fill}
          onChange={(fill) => updateProps({ fill, active: true })}
        />
      </div>

      <div className="prop-group">
        <label className="prop-label">Animation</label>
        <select
          value={firstCell.animationType}
          onChange={(e) => setAnimationType(e.target.value)}
        >
          {ANIMATION_TYPES.map((t) => (
            <option key={t} value={t}>{ANIMATION_TYPE_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <div className="prop-group">
        <label className="prop-label">
          Delay <span className="prop-value">{firstCell.delay.toFixed(2)}s</span>
        </label>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          value={firstCell.delay}
          onChange={(e) => updateProps({ delay: parseFloat(e.target.value) })}
        />
      </div>

      {multi && (
        <div className="stagger-group">
          <label className="prop-label">Stagger Pattern</label>
          <select
            value={staggerPattern}
            onChange={(e) => setStaggerPattern(e.target.value)}
          >
            {STAGGER_PATTERNS.map((p) => (
              <option key={p} value={p}>{STAGGER_PATTERN_LABELS[p]}</option>
            ))}
          </select>
          <label className="prop-label">
            Spread Time <span className="prop-value">{staggerTime.toFixed(2)}s</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.05"
            value={staggerTime}
            onChange={(e) => setStaggerTime(parseFloat(e.target.value))}
          />
          <button className="stagger-apply-btn" onClick={applyStagger}>
            Apply Stagger
          </button>
        </div>
      )}

      <div className="prop-group">
        <label className="prop-label">
          Duration <span className="prop-value">{firstCell.duration.toFixed(2)}s</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={firstCell.duration}
          onChange={(e) => updateProps({ duration: parseFloat(e.target.value) })}
        />
      </div>

      <div className="prop-group">
        <label className="prop-label">Easing</label>
        <select
          value={firstCell.easing}
          onChange={(e) => updateProps({ easing: e.target.value })}
        >
          {EASING_OPTIONS.map((e) => (
            <option key={e} value={e}>{EASING_LABELS[e]}</option>
          ))}
        </select>
      </div>

      {firstCell.animationType !== 'none' && (
        <>
          <div className="prop-group">
            <label className="prop-label">Direction</label>
            <select
              value={firstCell.direction || 'normal'}
              onChange={(e) => updateProps({ direction: e.target.value })}
            >
              {ANIMATION_DIRECTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="prop-group">
            <label className="prop-label">Iterations</label>
            <div className="prop-range-row">
              <button
                className={`iteration-toggle${isInfinite ? ' active' : ''}`}
                onClick={() => updateProps({ iterationCount: isInfinite ? '1' : 'infinite' })}
              >
                {isInfinite ? '\u221E' : '#'}
              </button>
              {!isInfinite && (
                <>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="1"
                    value={parseInt(firstCell.iterationCount) || 1}
                    onChange={(e) => updateProps({ iterationCount: e.target.value })}
                  />
                  <span className="prop-value">{firstCell.iterationCount}</span>
                </>
              )}
            </div>
          </div>

          <div className="prop-group">
            <label className="prop-label">Fill Mode</label>
            <select
              value={firstCell.fillMode || 'none'}
              onChange={(e) => updateProps({ fillMode: e.target.value })}
            >
              {ANIMATION_FILL_MODES.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div className="prop-group">
        <label className="prop-label">Opacity</label>
        <div className="prop-range-row">
          <span className="prop-range-label">From</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={firstCell.opacity.from}
            onChange={(e) =>
              updateProps({ opacity: { ...firstCell.opacity, from: parseFloat(e.target.value) } })
            }
          />
          <span className="prop-value">{firstCell.opacity.from}</span>
        </div>
        <div className="prop-range-row">
          <span className="prop-range-label">To</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={firstCell.opacity.to}
            onChange={(e) =>
              updateProps({ opacity: { ...firstCell.opacity, to: parseFloat(e.target.value) } })
            }
          />
          <span className="prop-value">{firstCell.opacity.to}</span>
        </div>
      </div>

      <div className="prop-group">
        <label className="prop-label">Scale</label>
        <div className="prop-range-row">
          <span className="prop-range-label">From</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={firstCell.scale.from}
            onChange={(e) =>
              updateProps({ scale: { ...firstCell.scale, from: parseFloat(e.target.value) } })
            }
          />
          <span className="prop-value">{firstCell.scale.from}</span>
        </div>
        <div className="prop-range-row">
          <span className="prop-range-label">To</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={firstCell.scale.to}
            onChange={(e) =>
              updateProps({ scale: { ...firstCell.scale, to: parseFloat(e.target.value) } })
            }
          />
          <span className="prop-value">{firstCell.scale.to}</span>
        </div>
      </div>
    </div>
  );
}
