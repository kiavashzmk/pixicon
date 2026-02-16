import { PixiconError } from './errors.js';

export function resolveTargets(targets, document) {
  const cells = document.frames[document.activeFrameIndex || 0].cells;

  if (targets === '*all') {
    return Object.keys(cells);
  }

  if (targets === '*active') {
    return Object.keys(cells).filter(id => cells[id].active);
  }

  if (typeof targets === 'string') {
    if (!cells[targets]) {
      throw new PixiconError('INVALID_TARGET', `Cell "${targets}" not found in grid`, 'targets');
    }
    return [targets];
  }

  if (Array.isArray(targets)) {
    for (const id of targets) {
      if (typeof id !== 'string' || !cells[id]) {
        throw new PixiconError('INVALID_TARGET', `Cell "${id}" not found in grid`, 'targets');
      }
    }
    return targets;
  }

  if (targets && typeof targets === 'object' && targets.from && targets.to) {
    const [r1, c1] = targets.from;
    const [r2, c2] = targets.to;
    const ids = [];
    for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) {
      for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) {
        const id = `${r}-${c}`;
        if (cells[id]) ids.push(id);
      }
    }
    return ids;
  }

  throw new PixiconError('INVALID_TARGET', 'Invalid targets format', 'targets');
}
