import { PALETTES } from '../../../src/utils/palettes.js';
import { COLOR_SWATCHES } from '../../../src/constants.js';

export function handlePalette(verb, data, document) {
  return {
    palettes: PALETTES.map(p => ({
      name: p.name,
      colors: p.colors || COLOR_SWATCHES,
    })),
  };
}
