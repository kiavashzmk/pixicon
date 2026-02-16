const NON_UNDOABLE = new Set([
  'SELECT_CELL',
  'SELECT_RANGE',
  'DESELECT_ALL',
  'SET_ACTIVE_FRAME',
  'SET_ONION_SKIN',
  'SET_BG_COLOR',
]);

const MAX_HISTORY = 50;

export function undoable(reducer) {
  return function undoableReducer(state, action) {
    const { past, present, future } = state;

    switch (action.type) {
      case 'UNDO': {
        if (past.length === 0) return state;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);
        return {
          past: newPast,
          present: {
            ...previous,
            selectedCellIds: present.selectedCellIds,
            lastSelectedId: present.lastSelectedId,
            activeFrameIndex: Math.min(
              present.activeFrameIndex,
              previous.frames.length - 1,
            ),
          },
          future: [present, ...future],
        };
      }

      case 'REDO': {
        if (future.length === 0) return state;
        const next = future[0];
        const newFuture = future.slice(1);
        return {
          past: [...past, present],
          present: {
            ...next,
            selectedCellIds: present.selectedCellIds,
            lastSelectedId: present.lastSelectedId,
            activeFrameIndex: Math.min(
              present.activeFrameIndex,
              next.frames.length - 1,
            ),
          },
          future: newFuture,
        };
      }

      default: {
        const newPresent = reducer(present, action);

        if (newPresent === present) return state;

        if (NON_UNDOABLE.has(action.type)) {
          return { past, present: newPresent, future };
        }

        const newPast = past.length >= MAX_HISTORY
          ? [...past.slice(past.length - MAX_HISTORY + 1), present]
          : [...past, present];

        return {
          past: newPast,
          present: newPresent,
          future: [],
        };
      }
    }
  };
}
