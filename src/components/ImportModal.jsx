import { useCallback, useMemo, useRef, useState } from 'react';
import { useGridDispatch } from '../state/GridContext.jsx';
import { GRID_SIZE_OPTIONS } from '../constants.js';
import { loadImageFromFile, imageToPixelCells, generatePixelPreview } from '../utils/imageToPixels.js';
import './ImportModal.css';

const ACCEPT = 'image/png,image/jpeg,image/gif,image/svg+xml,image/webp';

export default function ImportModal({ onClose }) {
  const dispatch = useGridDispatch();
  const fileInputRef = useRef(null);
  const [img, setImg] = useState(null);
  const [sizeIndex, setSizeIndex] = useState(GRID_SIZE_OPTIONS.findIndex(o => o.rows === 16));
  const [error, setError] = useState(null);
  const [dragover, setDragover] = useState(false);

  const gridOption = GRID_SIZE_OPTIONS[sizeIndex];

  const preview = useMemo(() => {
    if (!img) return null;
    return generatePixelPreview(img, gridOption.cols, gridOption.rows);
  }, [img, gridOption]);

  const handleFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    setError(null);
    try {
      const loaded = await loadImageFromFile(file);
      setImg(loaded);
    } catch {
      setError('Failed to load image.');
    }
  }, []);

  function handleInputChange(e) {
    handleFile(e.target.files[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragover(false);
    handleFile(e.dataTransfer.files[0]);
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragover(true);
  }

  function handleDragLeave() {
    setDragover(false);
  }

  function handleApply() {
    if (!img) return;
    const data = imageToPixelCells(img, gridOption.cols, gridOption.rows);
    dispatch({ type: 'LOAD_PRESET', payload: data });
    onClose();
  }

  return (
    <div className="export-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="export-header">
          <h3>Import Image</h3>
          <button className="export-close" onClick={onClose}>&times;</button>
        </div>

        <div className="import-body">
          <div
            className={`import-dropzone${dragover ? ' dragover' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPT}
              onChange={handleInputChange}
              hidden
            />
            <div className="import-dropzone-label">
              {img ? 'Click or drop to replace image' : 'Click or drop an image here'}
            </div>
            <div className="import-dropzone-hint">PNG, JPG, GIF, SVG, WebP</div>
          </div>

          <div className="import-options">
            <label>Grid size</label>
            <select value={sizeIndex} onChange={(e) => setSizeIndex(Number(e.target.value))}>
              {GRID_SIZE_OPTIONS.map((opt, i) => (
                <option key={opt.label} value={i}>{opt.label}</option>
              ))}
            </select>
          </div>

          {error && <div className="import-error">{error}</div>}

          {preview && (
            <div className="import-preview">
              <img src={preview} alt="Pixel preview" />
            </div>
          )}

          <div className="export-actions">
            <button className="btn-primary" onClick={handleApply} disabled={!img}>
              Apply to Canvas
            </button>
            <button className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
