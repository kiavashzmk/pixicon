import { useState, useEffect, useMemo, useRef } from 'react';
import { useGridDispatch } from '../state/GridContext.jsx';
import { loadAllIcons, deleteIcon, docToState } from '../utils/galleryStorage.js';
import { generateSVG } from '../utils/svgGenerator.js';
import { generateMultiFrameSVG } from '../utils/svgGenerator.js';
import './GalleryPage.css';

function GalleryCard({ icon, onLoad, onDelete, highlighted }) {
  const cardRef = useRef(null);

  useEffect(() => {
    if (highlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);
  const svgString = useMemo(() => {
    const state = docToState(icon.doc);
    if (state.frames.length > 1) {
      return generateMultiFrameSVG(state.frames, state.gridSize, 2);
    }
    return generateSVG(state.cells, state.gridSize);
  }, [icon.doc]);

  const date = new Date(icon.createdAt).toLocaleDateString();

  return (
    <div ref={cardRef} className={`gallery-card${highlighted ? ' highlighted' : ''}`}>
      <div
        className="gallery-card-preview"
        style={{ background: icon.doc.bgColor || '#1a1a24' }}
      >
        {svgString ? (
          <div dangerouslySetInnerHTML={{ __html: svgString }} />
        ) : (
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Empty</span>
        )}
      </div>
      <div className="gallery-card-info">
        <p className="gallery-card-name">{icon.name}</p>
        <p className="gallery-card-date">{date}</p>
        <div className="gallery-card-actions">
          <button className="gallery-load-btn" onClick={() => onLoad(icon)}>
            Load
          </button>
          {icon.source === 'local' && (
            <button className="gallery-delete-btn" onClick={() => onDelete(icon.id)}>
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GalleryPage({ setView, highlightId }) {
  const dispatch = useGridDispatch();
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllIcons().then(result => {
      setIcons(result);
      setLoading(false);
    });
  }, []);

  function handleLoad(icon) {
    const state = docToState(icon.doc);
    dispatch({
      type: 'LOAD_PRESET',
      payload: { cells: state.cells, gridSize: state.gridSize },
    });
    dispatch({ type: 'SET_BG_COLOR', payload: state.bgColor });
    setView('editor');
  }

  function handleDelete(id) {
    deleteIcon(id);
    setIcons(prev => prev.filter(i => i.id !== id));
  }

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h2>Gallery</h2>
        <button className="gallery-back-btn" onClick={() => setView('editor')}>
          Back to Editor
        </button>
      </div>

      {loading ? (
        <p className="gallery-empty">Loading...</p>
      ) : icons.length === 0 ? (
        <p className="gallery-empty">
          No saved icons yet. Create an icon in the editor and click Save.
        </p>
      ) : (
        <div className="gallery-grid">
          {icons.map(icon => (
            <GalleryCard
              key={icon.id}
              icon={icon}
              onLoad={handleLoad}
              onDelete={handleDelete}
              highlighted={highlightId === icon.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
