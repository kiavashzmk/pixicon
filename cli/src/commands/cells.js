import { dispatch, documentToState, stateToDocument } from '../document.js';
import { resolveTargets } from '../targets.js';
import { getPatternCells } from '../patterns.js';
import { PixiconError } from '../errors.js';
import { gridReducer } from '../../../src/state/gridReducer.js';

function requireDoc(document) {
  if (!document) {
    throw new PixiconError('NO_DOCUMENT', 'This command requires a document on stdin or --input', 'stdin');
  }
}

function setCells(document, targets, props) {
  const ids = resolveTargets(targets, document);
  return dispatch(document, { type: 'UPDATE_CELL_PROPS', payload: { ids, props } });
}

export function handleCells(verb, data, document) {
  switch (verb) {
    case 'set': {
      requireDoc(document);
      if (!data?.targets) {
        throw new PixiconError('MISSING_PARAM', 'set requires targets', 'data.targets');
      }
      if (!data?.props) {
        throw new PixiconError('MISSING_PARAM', 'set requires props', 'data.props');
      }
      return setCells(document, data.targets, data.props);
    }

    case 'clear': {
      requireDoc(document);
      if (!data?.targets) {
        throw new PixiconError('MISSING_PARAM', 'clear requires targets', 'data.targets');
      }
      const ids = resolveTargets(data.targets, document);
      return dispatch(document, { type: 'DEACTIVATE_CELLS', payload: { ids } });
    }

    case 'query': {
      requireDoc(document);
      if (!data?.targets) {
        throw new PixiconError('MISSING_PARAM', 'query requires targets', 'data.targets');
      }
      const ids = resolveTargets(data.targets, document);
      const cells = document.frames[document.activeFrameIndex || 0].cells;
      const result = ids.map(id => ({ id, ...cells[id] }));
      return { cells: result, count: result.length };
    }

    case 'fill-rect': {
      requireDoc(document);
      if (!data?.from || !data?.to) {
        throw new PixiconError('MISSING_PARAM', 'fill-rect requires from and to', 'data.from/to');
      }
      const targets = { from: data.from, to: data.to };
      return setCells(document, targets, data.props || { active: true });
    }

    case 'fill-pattern': {
      requireDoc(document);
      if (!data?.pattern) {
        throw new PixiconError('MISSING_PARAM', 'fill-pattern requires pattern', 'data.pattern');
      }
      const gridSize = document.gridSize;
      const ids = getPatternCells(data.pattern, gridSize);
      if (ids.length === 0) {
        throw new PixiconError('EMPTY_PATTERN', `Pattern "${data.pattern}" produced no cells`, 'data.pattern');
      }
      return dispatch(document, {
        type: 'UPDATE_CELL_PROPS',
        payload: { ids, props: data.props || { active: true } },
      });
    }

    default:
      throw new PixiconError('UNKNOWN_VERB', `Unknown cells verb: "${verb}"`, 'command');
  }
}
