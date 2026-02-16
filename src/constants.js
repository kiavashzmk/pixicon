export const ANIMATION_TYPES = [
  'none', 'pulse', 'fade', 'bounce', 'spin',
  'shake', 'wobble', 'flip', 'glow', 'slide-in', 'typewriter',
];

export const ANIMATION_TYPE_LABELS = {
  'none': 'None', 'pulse': 'Pulse', 'fade': 'Fade', 'bounce': 'Bounce',
  'spin': 'Spin', 'shake': 'Shake', 'wobble': 'Wobble', 'flip': 'Flip',
  'glow': 'Glow', 'slide-in': 'Slide In', 'typewriter': 'Typewriter',
};

export const ANIMATION_DIRECTIONS = ['normal', 'reverse', 'alternate', 'alternate-reverse'];
export const ANIMATION_FILL_MODES = ['none', 'forwards', 'backwards', 'both'];

export const EASING_OPTIONS = [
  'linear',
  'ease',
  'ease-in',
  'ease-out',
  'ease-in-out',
  'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
];

export const EASING_LABELS = {
  'linear': 'Linear',
  'ease': 'Ease',
  'ease-in': 'Ease In',
  'ease-out': 'Ease Out',
  'ease-in-out': 'Ease In Out',
  'cubic-bezier(0.68, -0.55, 0.27, 1.55)': 'Bouncy',
};

export const GRID_SIZE_OPTIONS = [
  { rows: 4, cols: 4, label: '4 x 4' },
  { rows: 8, cols: 8, label: '8 x 8' },
  { rows: 10, cols: 10, label: '10 x 10' },
  { rows: 12, cols: 12, label: '12 x 12' },
  { rows: 16, cols: 16, label: '16 x 16' },
  { rows: 24, cols: 24, label: '24 x 24' },
  { rows: 32, cols: 32, label: '32 x 32' },
];

export const COLOR_SWATCHES = [
  '#6366f1', '#818cf8', '#a78bfa', '#c084fc',
  '#ec4899', '#f43f5e', '#ef4444', '#f97316',
  '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#ffffff',
];

export const STAGGER_PATTERNS = [
  'left-to-right', 'top-to-bottom', 'diagonal', 'radial', 'random', 'spiral',
];
export const STAGGER_PATTERN_LABELS = {
  'left-to-right': 'Left \u2192 Right', 'top-to-bottom': 'Top \u2192 Bottom',
  'diagonal': 'Diagonal', 'radial': 'Radial', 'random': 'Random', 'spiral': 'Spiral',
};

export const DEFAULT_CELL = {
  fill: '#6366f1',
  opacity: { from: 1, to: 0.2 },
  scale: { from: 1, to: 1 },
  delay: 0,
  duration: 1,
  easing: 'ease-in-out',
  animationType: 'none',
  direction: 'normal',
  iterationCount: 'infinite',
  fillMode: 'none',
  active: false,
};

export const CELL_SIZE = 40;
