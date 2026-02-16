import { useEffect } from 'react';
import { GridProvider, useGrid, useGridDispatch } from './state/GridContext.jsx';
import Toolbar from './components/Toolbar.jsx';
import GridCanvas from './components/GridCanvas.jsx';
import Timeline from './components/Timeline.jsx';
import CellPropertiesPanel from './components/CellPropertiesPanel.jsx';
import PreviewPanel from './components/PreviewPanel.jsx';
import './App.css';

function AppInner() {
  const { selectedCellIds } = useGrid();
  const dispatch = useGridDispatch();

  useEffect(() => {
    function handleKeyDown(e) {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: 'REDO' });
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
        return;
      }

      if (e.key === 'Escape') {
        dispatch({ type: 'DESELECT_ALL' });
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCellIds.length > 0) {
        dispatch({ type: 'DEACTIVATE_CELLS', payload: { ids: selectedCellIds } });
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, selectedCellIds]);

  return (
    <div className="app">
      <Toolbar />
      <div className="app-body">
        <div className="app-left">
          <GridCanvas />
          <Timeline />
        </div>
        <div className="app-right">
          <CellPropertiesPanel />
          <PreviewPanel />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GridProvider>
      <AppInner />
    </GridProvider>
  );
}
