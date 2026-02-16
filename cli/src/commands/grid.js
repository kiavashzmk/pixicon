import { createDocument, dispatch } from '../document.js';
import { PixiconError } from '../errors.js';

export function handleGrid(verb, data, document) {
  switch (verb) {
    case 'create': {
      const rows = data?.rows || 8;
      const cols = data?.cols || 8;
      if (rows < 1 || cols < 1 || rows > 64 || cols > 64) {
        throw new PixiconError('INVALID_SIZE', 'Grid size must be between 1 and 64', 'data.rows/cols');
      }
      return createDocument(rows, cols);
    }

    case 'resize': {
      if (!document) {
        throw new PixiconError('NO_DOCUMENT', 'resize requires a document on stdin or --input', 'stdin');
      }
      if (!data?.rows || !data?.cols) {
        throw new PixiconError('MISSING_PARAM', 'resize requires rows and cols', 'data');
      }
      return dispatch(document, { type: 'SET_GRID_SIZE', payload: { rows: data.rows, cols: data.cols } });
    }

    default:
      throw new PixiconError('UNKNOWN_VERB', `Unknown grid verb: "${verb}"`, 'command');
  }
}
