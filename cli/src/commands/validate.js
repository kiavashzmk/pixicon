import {
  ANIMATION_TYPES,
  EASING_OPTIONS,
  ANIMATION_DIRECTIONS,
  ANIMATION_FILL_MODES,
} from '../../../src/constants.js';

export function handleValidate(verb, data, document) {
  if (!document) {
    return { valid: false, errors: [{ path: 'stdin', message: 'No document provided' }] };
  }

  const errors = [];

  if (document.version == null) {
    errors.push({ path: 'version', message: 'Missing version field' });
  }

  if (!document.gridSize || !document.gridSize.rows || !document.gridSize.cols) {
    errors.push({ path: 'gridSize', message: 'Missing or invalid gridSize' });
  }

  if (!Array.isArray(document.frames) || document.frames.length === 0) {
    errors.push({ path: 'frames', message: 'Missing or empty frames array' });
    return { valid: false, errors };
  }

  const { rows, cols } = document.gridSize || {};

  for (let fi = 0; fi < document.frames.length; fi++) {
    const frame = document.frames[fi];
    if (!frame.cells || typeof frame.cells !== 'object') {
      errors.push({ path: `frames[${fi}].cells`, message: 'Missing cells object' });
      continue;
    }

    for (const [id, cell] of Object.entries(frame.cells)) {
      const match = id.match(/^(\d+)-(\d+)$/);
      if (!match) {
        errors.push({ path: `frames[${fi}].cells["${id}"]`, message: 'Invalid cell ID format' });
        continue;
      }

      if (rows && cols) {
        const [r, c] = [parseInt(match[1]), parseInt(match[2])];
        if (r >= rows || c >= cols) {
          errors.push({ path: `frames[${fi}].cells["${id}"]`, message: `Cell out of bounds (grid is ${rows}x${cols})` });
        }
      }

      if (cell.animationType && !ANIMATION_TYPES.includes(cell.animationType)) {
        errors.push({ path: `frames[${fi}].cells["${id}"].animationType`, message: `Unknown animation type: "${cell.animationType}"` });
      }

      if (cell.easing && !EASING_OPTIONS.includes(cell.easing)) {
        errors.push({ path: `frames[${fi}].cells["${id}"].easing`, message: `Unknown easing: "${cell.easing}"` });
      }

      if (cell.direction && !ANIMATION_DIRECTIONS.includes(cell.direction)) {
        errors.push({ path: `frames[${fi}].cells["${id}"].direction`, message: `Unknown direction: "${cell.direction}"` });
      }

      if (cell.fillMode && !ANIMATION_FILL_MODES.includes(cell.fillMode)) {
        errors.push({ path: `frames[${fi}].cells["${id}"].fillMode`, message: `Unknown fill mode: "${cell.fillMode}"` });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
