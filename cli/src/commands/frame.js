import { dispatch, dispatchMany, documentToState, stateToDocument } from '../document.js';
import { PixiconError } from '../errors.js';
import { gridReducer } from '../../../src/state/gridReducer.js';

function requireDoc(document) {
  if (!document) {
    throw new PixiconError('NO_DOCUMENT', 'This command requires a document on stdin or --input', 'stdin');
  }
}

export function handleFrame(verb, data, document) {
  switch (verb) {
    case 'add': {
      requireDoc(document);
      return dispatch(document, { type: 'ADD_FRAME' });
    }

    case 'duplicate': {
      requireDoc(document);
      const actions = [];
      if (data?.sourceIndex != null) {
        actions.push({ type: 'SET_ACTIVE_FRAME', payload: { index: data.sourceIndex } });
      }
      actions.push({ type: 'DUPLICATE_FRAME' });
      return dispatchMany(document, actions);
    }

    case 'remove': {
      requireDoc(document);
      if (data?.index == null) {
        throw new PixiconError('MISSING_PARAM', 'remove requires index', 'data.index');
      }
      return dispatchMany(document, [
        { type: 'SET_ACTIVE_FRAME', payload: { index: data.index } },
        { type: 'REMOVE_FRAME' },
      ]);
    }

    case 'set-active': {
      requireDoc(document);
      if (data?.index == null) {
        throw new PixiconError('MISSING_PARAM', 'set-active requires index', 'data.index');
      }
      return dispatch(document, { type: 'SET_ACTIVE_FRAME', payload: { index: data.index } });
    }

    case 'list': {
      requireDoc(document);
      const activeIndex = document.activeFrameIndex || 0;
      const frames = document.frames.map((f, i) => {
        const activeCells = Object.values(f.cells).filter(c => c.active).length;
        return {
          index: i,
          id: f.id,
          activeCells,
          isActive: i === activeIndex,
        };
      });
      return { frames, count: frames.length };
    }

    default:
      throw new PixiconError('UNKNOWN_VERB', `Unknown frame verb: "${verb}"`, 'command');
  }
}
