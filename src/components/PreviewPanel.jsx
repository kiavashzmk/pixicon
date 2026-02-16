import { useMemo } from 'react';
import { useGrid } from '../state/GridContext.jsx';
import { generateSVG } from '../utils/svgGenerator.js';
import './PreviewPanel.css';

export default function PreviewPanel() {
  const { cells, gridSize, bgColor } = useGrid();

  const svgString = useMemo(
    () => generateSVG(cells, gridSize),
    [cells, gridSize]
  );

  return (
    <div className="preview-panel">
      <h3 className="panel-title">Preview</h3>
      <div className="preview-area" style={{ background: bgColor }}>
        {svgString ? (
          <div
            className="preview-svg"
            dangerouslySetInnerHTML={{ __html: svgString }}
          />
        ) : (
          <p className="preview-empty">Activate cells to see preview</p>
        )}
      </div>
    </div>
  );
}
