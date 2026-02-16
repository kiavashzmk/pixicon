export function calculateStaggerDelays(cells, pattern, totalTime) {
  const entries = Object.entries(cells);
  if (entries.length === 0) return {};

  const rawValues = {};

  for (const [id, cell] of entries) {
    const row = cell.row;
    const col = cell.col;
    let raw;

    switch (pattern) {
      case 'left-to-right':
        raw = col;
        break;
      case 'top-to-bottom':
        raw = row;
        break;
      case 'diagonal':
        raw = row + col;
        break;
      case 'radial': {
        const rows = entries.map(([, c]) => c.row);
        const cols = entries.map(([, c]) => c.col);
        const centerR = (Math.min(...rows) + Math.max(...rows)) / 2;
        const centerC = (Math.min(...cols) + Math.max(...cols)) / 2;
        raw = Math.sqrt((row - centerR) ** 2 + (col - centerC) ** 2);
        break;
      }
      case 'random':
        raw = Math.random();
        break;
      case 'spiral': {
        const rows = entries.map(([, c]) => c.row);
        const cols = entries.map(([, c]) => c.col);
        const centerR = (Math.min(...rows) + Math.max(...rows)) / 2;
        const centerC = (Math.min(...cols) + Math.max(...cols)) / 2;
        const dr = row - centerR;
        const dc = col - centerC;
        const dist = Math.sqrt(dr * dr + dc * dc);
        raw = Math.atan2(dr, dc) + dist * 0.01;
        break;
      }
      default:
        raw = 0;
    }

    rawValues[id] = raw;
  }

  const values = Object.values(rawValues);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const delays = {};
  for (const [id, raw] of Object.entries(rawValues)) {
    delays[id] = range === 0 ? 0 : ((raw - min) / range) * totalTime;
  }

  return delays;
}
