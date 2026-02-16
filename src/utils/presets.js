import { DEFAULT_CELL } from '../constants.js';

function cell(row, col, overrides = {}) {
  return {
    id: `${row}-${col}`,
    row,
    col,
    ...DEFAULT_CELL,
    active: true,
    ...overrides,
  };
}

function buildPreset(gridSize, cellDefs) {
  const cells = {};
  for (let r = 0; r < gridSize.rows; r++) {
    for (let c = 0; c < gridSize.cols; c++) {
      const key = `${r}-${c}`;
      cells[key] = { id: key, row: r, col: c, ...DEFAULT_CELL };
    }
  }
  for (const c of cellDefs) {
    cells[c.id] = c;
  }
  return { gridSize, cells };
}

export function spinnerPreset() {
  const size = { rows: 8, cols: 8 };
  const perimeter = [];

  // Top row
  for (let c = 0; c < 8; c++) perimeter.push([0, c]);
  // Right col (skip corner)
  for (let r = 1; r < 8; r++) perimeter.push([r, 7]);
  // Bottom row reverse (skip corner)
  for (let c = 6; c >= 0; c--) perimeter.push([7, c]);
  // Left col reverse (skip corners)
  for (let r = 6; r >= 1; r--) perimeter.push([r, 0]);

  const total = perimeter.length;
  const defs = perimeter.map(([r, c], i) =>
    cell(r, c, {
      fill: '#6366f1',
      animationType: 'fade',
      opacity: { from: 1, to: 0.1 },
      delay: (i / total) * 1.2,
      duration: 1.2,
      easing: 'ease-in-out',
    })
  );

  return buildPreset(size, defs);
}

export function bouncingDotsPreset() {
  const size = { rows: 8, cols: 8 };
  const dots = [
    [3, 2], [3, 4], [3, 6],
  ];
  const defs = dots.map(([r, c], i) =>
    cell(r, c, {
      fill: '#ec4899',
      animationType: 'bounce',
      opacity: { from: 1, to: 0.6 },
      scale: { from: 1, to: 1.3 },
      delay: i * 0.15,
      duration: 0.6,
      easing: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
    })
  );
  return buildPreset(size, defs);
}

export function pulsingGridPreset() {
  const size = { rows: 8, cols: 8 };
  const defs = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      defs.push(
        cell(r, c, {
          fill: '#6366f1',
          animationType: 'pulse',
          opacity: { from: 1, to: 0.2 },
          scale: { from: 1, to: 1.1 },
          delay: (r + c) * 0.08,
          duration: 1.2,
          easing: 'ease-in-out',
        })
      );
    }
  }
  return buildPreset(size, defs);
}

export function barsPreset() {
  const size = { rows: 8, cols: 8 };
  const heights = [3, 5, 7, 8, 7, 5, 3, 2];
  const defs = [];
  for (let c = 0; c < 8; c++) {
    const h = heights[c];
    for (let r = 8 - h; r < 8; r++) {
      defs.push(
        cell(r, c, {
          fill: '#22c55e',
          animationType: 'pulse',
          opacity: { from: 1, to: 0.3 },
          scale: { from: 1, to: 1 },
          delay: c * 0.12,
          duration: 0.8,
          easing: 'ease-in-out',
        })
      );
    }
  }
  return buildPreset(size, defs);
}

export function wavePreset() {
  const size = { rows: 8, cols: 8 };
  const defs = [];
  for (let c = 0; c < 8; c++) {
    for (let r = 5; r < 8; r++) {
      defs.push(
        cell(r, c, {
          fill: '#3b82f6',
          animationType: 'bounce',
          opacity: { from: 1, to: 0.5 },
          scale: { from: 1, to: 1.1 },
          delay: c * 0.1,
          duration: 0.8,
          easing: 'ease-in-out',
        })
      );
    }
  }
  return buildPreset(size, defs);
}

export function heartbeatPreset() {
  const size = { rows: 8, cols: 8 };
  // Heart shape on 8x8 grid
  const heartCoords = [
    [1, 1], [1, 2], [1, 5], [1, 6],
    [2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7],
    [3, 0], [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6], [3, 7],
    [4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6],
    [5, 2], [5, 3], [5, 4], [5, 5],
    [6, 3], [6, 4],
  ];

  const defs = heartCoords.map(([r, c]) =>
    cell(r, c, {
      fill: '#ef4444',
      animationType: 'pulse',
      opacity: { from: 1, to: 0.6 },
      scale: { from: 1, to: 1.15 },
      delay: 0,
      duration: 0.8,
      easing: 'ease-in-out',
    })
  );

  return buildPreset(size, defs);
}

export const PRESETS = [
  { name: 'Spinner', fn: spinnerPreset },
  { name: 'Dots', fn: bouncingDotsPreset },
  { name: 'Bars', fn: barsPreset },
  { name: 'Wave', fn: wavePreset },
  { name: 'Pulse Grid', fn: pulsingGridPreset },
  { name: 'Heartbeat', fn: heartbeatPreset },
];
