import { useMemo, useRef, useState } from 'react';
import { useGrid } from '../state/GridContext.jsx';
import { generateSVG, generateMultiFrameSVG } from '../utils/svgGenerator.js';
import { generateCSS, generateMultiFrameCSS } from '../utils/cssGenerator.js';
import { generateReactComponent, generateMultiFrameReact } from '../utils/reactGenerator.js';
import './ExportModal.css';

const TABS = [
  { id: 'svg', label: 'SVG', ext: '.svg', mime: 'image/svg+xml' },
  { id: 'css', label: 'CSS', ext: '.html', mime: 'text/html' },
  { id: 'react', label: 'React', ext: '.jsx', mime: 'text/javascript' },
];

export default function ExportModal({ onClose }) {
  const { cells, gridSize, frames } = useGrid();
  const textareaRef = useRef(null);
  const [activeTab, setActiveTab] = useState('svg');
  const [exportFps, setExportFps] = useState(4);
  const copyBtnRef = useRef(null);

  const isMultiFrame = frames && frames.length > 1;

  const outputs = useMemo(() => {
    if (isMultiFrame) {
      return {
        svg: generateMultiFrameSVG(frames, gridSize, exportFps),
        css: generateMultiFrameCSS(frames, gridSize, exportFps),
        react: generateMultiFrameReact(frames, gridSize, exportFps),
      };
    }
    return {
      svg: generateSVG(cells, gridSize),
      css: generateCSS(cells, gridSize),
      react: generateReactComponent(cells, gridSize),
    };
  }, [cells, gridSize, frames, isMultiFrame, exportFps]);

  const currentTab = TABS.find(t => t.id === activeTab);
  const currentOutput = outputs[activeTab];

  function handleCopy() {
    navigator.clipboard.writeText(currentOutput).then(() => {
      const btn = copyBtnRef.current;
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = `Copy ${currentTab.label}`; }, 1500);
      }
    });
  }

  function handleDownload() {
    const blob = new Blob([currentOutput], { type: currentTab.mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixel-grid${currentTab.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="export-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-header">
          <h3>Export</h3>
          <button className="export-close" onClick={onClose}>&times;</button>
        </div>

        <div className="export-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`export-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isMultiFrame && (
          <div className="export-fps-row">
            <label className="export-fps-label">FPS</label>
            <input
              type="range"
              min="1"
              max="30"
              value={exportFps}
              onChange={(e) => setExportFps(Number(e.target.value))}
            />
            <span className="export-fps-value">{exportFps}</span>
          </div>
        )}

        {currentOutput ? (
          <>
            <textarea
              ref={textareaRef}
              className="export-code"
              value={currentOutput}
              readOnly
              rows={14}
            />
            <div className="export-actions">
              <button ref={copyBtnRef} className="export-copy-btn btn-primary" onClick={handleCopy}>
                Copy {currentTab.label}
              </button>
              <button className="btn-secondary" onClick={handleDownload}>
                Download {currentTab.ext}
              </button>
            </div>
          </>
        ) : (
          <p className="export-empty">No active cells to export</p>
        )}
      </div>
    </div>
  );
}
