import { dispatch, documentToState, stateToDocument } from '../document.js';
import { resolveTargets } from '../targets.js';
import { PixiconError } from '../errors.js';
import { calculateStaggerDelays } from '../../../src/utils/staggerPatterns.js';
import { PRESETS } from '../../../src/utils/presets.js';
import { gridReducer } from '../../../src/state/gridReducer.js';

export function handleAnim(verb, data, document) {
  switch (verb) {
    case 'stagger': {
      if (!document) {
        throw new PixiconError('NO_DOCUMENT', 'stagger requires a document on stdin or --input', 'stdin');
      }
      if (!data?.pattern) {
        throw new PixiconError('MISSING_PARAM', 'stagger requires pattern', 'data.pattern');
      }
      if (data?.totalTime == null) {
        throw new PixiconError('MISSING_PARAM', 'stagger requires totalTime', 'data.totalTime');
      }

      const targets = data.targets || '*active';
      const ids = resolveTargets(targets, document);
      const cells = document.frames[document.activeFrameIndex || 0].cells;

      // Build subset of cells for the stagger calculation
      const cellsSubset = {};
      for (const id of ids) {
        if (cells[id]) {
          const [row, col] = id.split('-').map(Number);
          cellsSubset[id] = { id, row, col, ...cells[id] };
        }
      }

      const delays = calculateStaggerDelays(cellsSubset, data.pattern, data.totalTime);
      return dispatch(document, { type: 'APPLY_STAGGER', payload: { delays } });
    }

    case 'preset': {
      if (!data?.preset) {
        throw new PixiconError('MISSING_PARAM', 'preset requires preset name', 'data.preset');
      }

      const presetEntry = PRESETS.find(
        p => p.name.toLowerCase() === data.preset.toLowerCase()
      );
      if (!presetEntry) {
        const names = PRESETS.map(p => p.name).join(', ');
        throw new PixiconError('UNKNOWN_PRESET', `Unknown preset: "${data.preset}". Available: ${names}`, 'data.preset');
      }

      const presetData = presetEntry.fn();

      if (document && data.mode === 'merge') {
        return dispatch(document, {
          type: 'APPLY_PRESET_ANIMATION',
          payload: { cells: presetData.cells, gridSize: presetData.gridSize },
        });
      }

      // Load as new document
      const state = documentToState(document || {
        version: 1,
        gridSize: { rows: 8, cols: 8 },
        frames: [{ id: 0, cells: {} }],
      });
      const newState = gridReducer(state, {
        type: 'LOAD_PRESET',
        payload: { cells: presetData.cells, gridSize: presetData.gridSize },
      });
      return stateToDocument(newState);
    }

    default:
      throw new PixiconError('UNKNOWN_VERB', `Unknown anim verb: "${verb}"`, 'command');
  }
}
