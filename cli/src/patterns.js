export function getPatternCells(pattern, gridSize) {
  const { rows, cols } = gridSize;
  const ids = [];

  switch (pattern) {
    case 'border':
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
            ids.push(`${r}-${c}`);
          }
        }
      }
      break;

    case 'checkerboard':
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if ((r + c) % 2 === 0) ids.push(`${r}-${c}`);
        }
      }
      break;

    case 'diagonal':
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === c || r === cols - 1 - c) ids.push(`${r}-${c}`);
        }
      }
      break;

    case 'cross': {
      const midR = Math.floor((rows - 1) / 2);
      const midC = Math.floor((cols - 1) / 2);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === midR || c === midC) ids.push(`${r}-${c}`);
        }
      }
      break;
    }

    case 'x-mark': {
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const onDiag1 = Math.abs(r / (rows - 1) - c / (cols - 1)) < 1 / Math.max(rows, cols);
          const onDiag2 = Math.abs(r / (rows - 1) - (1 - c / (cols - 1))) < 1 / Math.max(rows, cols);
          if (r === c || r === rows - 1 - c || onDiag1 || onDiag2) ids.push(`${r}-${c}`);
        }
      }
      break;
    }

    case 'circle': {
      const cr = (rows - 1) / 2;
      const cc = (cols - 1) / 2;
      const radius = Math.min(cr, cc);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dr = (r - cr) / (radius || 1);
          const dc = (c - cc) / (radius || 1);
          const dist = Math.sqrt(dr * dr + dc * dc);
          if (dist >= 0.7 && dist <= 1.3) ids.push(`${r}-${c}`);
        }
      }
      break;
    }

    case 'diamond': {
      const cr = (rows - 1) / 2;
      const cc = (cols - 1) / 2;
      const size = Math.min(cr, cc);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const dist = Math.abs(r - cr) + Math.abs(c - cc);
          if (Math.abs(dist - size) <= 0.5) ids.push(`${r}-${c}`);
        }
      }
      break;
    }

    case 'corners':
      for (const r of [0, rows - 1]) {
        for (const c of [0, cols - 1]) {
          ids.push(`${r}-${c}`);
        }
      }
      break;

    default:
      return [];
  }

  return ids;
}
