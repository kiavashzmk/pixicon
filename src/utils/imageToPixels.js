import { DEFAULT_CELL } from '../constants.js';

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

function drawContained(ctx, img, cols, rows) {
  ctx.clearRect(0, 0, cols, rows);
  const scale = Math.min(cols / img.width, rows / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (cols - w) / 2;
  const y = (rows - h) / 2;
  ctx.drawImage(img, x, y, w, h);
}

function rgbaToHex(r, g, b) {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function imageToPixelCells(img, cols, rows) {
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d');
  drawContained(ctx, img, cols, rows);

  const data = ctx.getImageData(0, 0, cols, rows).data;
  const cells = {};

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = (r * cols + c) * 4;
      const alpha = data[i + 3];
      const key = `${r}-${c}`;
      if (alpha >= 128) {
        cells[key] = {
          ...DEFAULT_CELL,
          id: key,
          row: r,
          col: c,
          fill: rgbaToHex(data[i], data[i + 1], data[i + 2]),
          active: true,
        };
      } else {
        cells[key] = {
          ...DEFAULT_CELL,
          id: key,
          row: r,
          col: c,
          active: false,
        };
      }
    }
  }

  return { cells, gridSize: { rows, cols } };
}

export function generatePixelPreview(img, cols, rows) {
  const small = document.createElement('canvas');
  small.width = cols;
  small.height = rows;
  const sCtx = small.getContext('2d');
  drawContained(sCtx, img, cols, rows);

  const previewSize = 256;
  const canvas = document.createElement('canvas');
  canvas.width = previewSize;
  canvas.height = previewSize;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, previewSize, previewSize);

  return canvas.toDataURL();
}
