import { useState, useEffect, memo } from 'react';
import { useGrid, useGridDispatch } from '../state/GridContext.jsx';
import './Timeline.css';

const FrameThumbnail = memo(function FrameThumbnail({ frame, gridSize, isActive, onClick }) {
  const cellSize = 3;
  const gap = 1;
  const activeCells = Object.values(frame.cells).filter(c => c.active);

  return (
    <button
      className={`timeline-thumb${isActive ? ' active' : ''}`}
      onClick={onClick}
      title={`Frame ${frame.id}`}
    >
      <div
        className="timeline-thumb-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize.cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${gridSize.rows}, ${cellSize}px)`,
          gap: `${gap}px`,
        }}
      >
        {activeCells.map(cell => (
          <div
            key={cell.id}
            style={{
              gridRow: cell.row + 1,
              gridColumn: cell.col + 1,
              background: cell.fill,
              borderRadius: 1,
              width: cellSize,
              height: cellSize,
            }}
          />
        ))}
      </div>
    </button>
  );
});

export default function Timeline() {
  const { frames, activeFrameIndex, gridSize, onionSkin } = useGrid();
  const dispatch = useGridDispatch();
  const [isPlaying, setIsPlaying] = useState(false);
  const [fps, setFps] = useState(4);

  useEffect(() => {
    if (!isPlaying || frames.length <= 1) return;
    const interval = setInterval(() => {
      dispatch({ type: 'SET_ACTIVE_FRAME', payload: { index: -1 } });
    }, 1000 / fps);
    return () => clearInterval(interval);
  }, [isPlaying, fps, frames.length, dispatch]);

  // Stop playback if down to 1 frame
  useEffect(() => {
    if (frames.length <= 1) setIsPlaying(false);
  }, [frames.length]);

  function toggleOnionSkin() {
    dispatch({ type: 'SET_ONION_SKIN', payload: { enabled: !onionSkin.enabled } });
  }

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button
          className="timeline-play-btn"
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={frames.length <= 1}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '\u23F8' : '\u25B6'}
        </button>

        <label className="timeline-fps">
          <span className="timeline-fps-label">FPS</span>
          <input
            type="range"
            min="1"
            max="30"
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
          />
          <span className="timeline-fps-value">{fps}</span>
        </label>

        <span className="timeline-counter">
          Frame {activeFrameIndex + 1} / {frames.length}
        </span>

        <div className="timeline-frame-actions">
          <button
            className={`timeline-action-btn${onionSkin.enabled ? ' active' : ''}`}
            onClick={toggleOnionSkin}
            title="Toggle onion skinning"
          >
            Onion
          </button>
          <button
            className="timeline-action-btn"
            onClick={() => dispatch({ type: 'DUPLICATE_FRAME' })}
            title="Duplicate frame"
          >
            Dup
          </button>
          <button
            className="timeline-action-btn danger"
            onClick={() => dispatch({ type: 'REMOVE_FRAME' })}
            disabled={frames.length <= 1}
            title="Delete frame"
          >
            Del
          </button>
        </div>
      </div>

      <div className="timeline-frames">
        {frames.map((frame, i) => (
          <FrameThumbnail
            key={frame.id}
            frame={frame}
            gridSize={gridSize}
            isActive={i === activeFrameIndex}
            onClick={() => dispatch({ type: 'SET_ACTIVE_FRAME', payload: { index: i } })}
          />
        ))}
        <button
          className="timeline-add-btn"
          onClick={() => dispatch({ type: 'ADD_FRAME' })}
          title="Add frame"
        >
          +
        </button>
      </div>
    </div>
  );
}
