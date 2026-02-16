import { createContext, useContext, useReducer, useMemo } from 'react';
import { gridReducer, initialState } from './gridReducer.js';
import { undoable } from './undoable.js';

const undoableReducer = undoable(gridReducer);
const undoableInitialState = { past: [], present: initialState, future: [] };

const GridContext = createContext(null);
const GridDispatchContext = createContext(null);

export function GridProvider({ children }) {
  const [state, dispatch] = useReducer(undoableReducer, undoableInitialState);

  const value = useMemo(() => ({
    ...state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  }), [state]);

  return (
    <GridContext.Provider value={value}>
      <GridDispatchContext.Provider value={dispatch}>
        {children}
      </GridDispatchContext.Provider>
    </GridContext.Provider>
  );
}

export function useGrid() {
  const ctx = useContext(GridContext);
  if (!ctx) throw new Error('useGrid must be used within GridProvider');
  return ctx;
}

export function useGridDispatch() {
  const ctx = useContext(GridDispatchContext);
  if (!ctx) throw new Error('useGridDispatch must be used within GridProvider');
  return ctx;
}
