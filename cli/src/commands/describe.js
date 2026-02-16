import { PixiconError } from '../errors.js';
import {
  ANIMATION_TYPES,
  ANIMATION_TYPE_LABELS,
  EASING_OPTIONS,
  EASING_LABELS,
  STAGGER_PATTERNS,
  STAGGER_PATTERN_LABELS,
  ANIMATION_DIRECTIONS,
  ANIMATION_FILL_MODES,
  DEFAULT_CELL,
  COLOR_SWATCHES,
} from '../../../src/constants.js';
import { PRESETS } from '../../../src/utils/presets.js';
import { PALETTES } from '../../../src/utils/palettes.js';

const TOPICS = {
  'animation-types': () => ({
    topic: 'animation-types',
    items: ANIMATION_TYPES.map(t => ({ value: t, label: ANIMATION_TYPE_LABELS[t] })),
  }),

  'easing-options': () => ({
    topic: 'easing-options',
    items: EASING_OPTIONS.map(e => ({ value: e, label: EASING_LABELS[e] })),
  }),

  'stagger-patterns': () => ({
    topic: 'stagger-patterns',
    items: STAGGER_PATTERNS.map(s => ({ value: s, label: STAGGER_PATTERN_LABELS[s] })),
  }),

  'presets': () => ({
    topic: 'presets',
    items: PRESETS.map(p => p.name),
  }),

  'palettes': () => ({
    topic: 'palettes',
    items: PALETTES.map(p => ({
      name: p.name,
      colors: p.colors || COLOR_SWATCHES,
    })),
  }),

  'directions': () => ({
    topic: 'directions',
    items: ANIMATION_DIRECTIONS,
  }),

  'fill-modes': () => ({
    topic: 'fill-modes',
    items: ANIMATION_FILL_MODES,
  }),

  'cell-properties': () => ({
    topic: 'cell-properties',
    properties: {
      fill: { type: 'string', description: 'CSS color', default: DEFAULT_CELL.fill },
      opacity: {
        type: 'object',
        description: '{ from: number, to: number } — opacity range for animation',
        default: DEFAULT_CELL.opacity,
      },
      scale: {
        type: 'object',
        description: '{ from: number, to: number } — scale range for animation',
        default: DEFAULT_CELL.scale,
      },
      delay: { type: 'number', description: 'Animation delay in seconds', default: DEFAULT_CELL.delay },
      duration: { type: 'number', description: 'Animation duration in seconds', default: DEFAULT_CELL.duration },
      easing: { type: 'string', description: 'CSS easing function', default: DEFAULT_CELL.easing, options: EASING_OPTIONS },
      animationType: { type: 'string', description: 'Animation type', default: DEFAULT_CELL.animationType, options: ANIMATION_TYPES },
      direction: { type: 'string', description: 'Animation direction', default: DEFAULT_CELL.direction, options: ANIMATION_DIRECTIONS },
      iterationCount: { type: 'string|number', description: 'Number of iterations or "infinite"', default: DEFAULT_CELL.iterationCount },
      fillMode: { type: 'string', description: 'Animation fill mode', default: DEFAULT_CELL.fillMode, options: ANIMATION_FILL_MODES },
      active: { type: 'boolean', description: 'Whether cell is visible/painted', default: DEFAULT_CELL.active },
    },
  }),
};

export function handleDescribe(verb, data, document) {
  const topic = verb || data?.topic;

  if (!topic) {
    return { topics: Object.keys(TOPICS) };
  }

  const handler = TOPICS[topic];
  if (!handler) {
    throw new PixiconError('UNKNOWN_TOPIC', `Unknown topic: "${topic}". Available: ${Object.keys(TOPICS).join(', ')}`, 'topic');
  }

  return handler();
}
