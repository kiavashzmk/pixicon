import { generateCSSKeyframes, buildAnimationShorthand } from './keyframeGenerator.js';

const CELL_PX = 10;
const GAP_PX = 2;

export function generateCSS(cells, gridSize) {
  const activeCells = Object.values(cells).filter((c) => c.active);
  if (activeCells.length === 0) return '';

  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const c of activeCells) {
    if (c.row < minR) minR = c.row;
    if (c.row > maxR) maxR = c.row;
    if (c.col < minC) minC = c.col;
    if (c.col > maxC) maxC = c.col;
  }

  const spanC = maxC - minC + 1;

  const keyframesCSS = [];
  const cellStyles = [];
  const divs = [];

  for (const cell of activeCells) {
    const gridRow = cell.row - minR + 1;
    const gridCol = cell.col - minC + 1;
    const cls = `c-${cell.id}`;

    if (cell.animationType !== 'none') {
      keyframesCSS.push(generateCSSKeyframes(cell.animationType, cell));
      const animName = `${cell.animationType}-${cell.id}`;
      cellStyles.push(
        `.${cls} { animation: ${buildAnimationShorthand(animName, cell)}; transform-origin: center; }`
      );
    }

    const opacity = cell.animationType === 'none' ? `opacity:${cell.opacity.from};` : '';
    divs.push(
      `  <div class="pixel-cell ${cls}" style="grid-row:${gridRow};grid-column:${gridCol};background:${cell.fill};${opacity}"></div>`
    );
  }

  const styleBlock = [
    `.pixel-grid { display: grid; grid-template-columns: repeat(${spanC}, ${CELL_PX}px); gap: ${GAP_PX}px; }`,
    `.pixel-cell { border-radius: 2px; width: ${CELL_PX}px; height: ${CELL_PX}px; }`,
    ...keyframesCSS,
    ...cellStyles,
  ].join('\n    ');

  return `<div class="pixel-grid">
  <style>
    ${styleBlock}
  </style>
${divs.join('\n')}
</div>`;
}

export function generateMultiFrameCSS(frames, gridSize, fps) {
  // Collect all cells across all frames
  const allCellIds = new Set();
  for (const frame of frames) {
    for (const cell of Object.values(frame.cells)) {
      if (cell.active) allCellIds.add(cell.id);
    }
  }
  if (allCellIds.size === 0) return '';

  // Bounding box across all frames
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const frame of frames) {
    for (const cell of Object.values(frame.cells)) {
      if (!cell.active) continue;
      if (cell.row < minR) minR = cell.row;
      if (cell.row > maxR) maxR = cell.row;
      if (cell.col < minC) minC = cell.col;
      if (cell.col > maxC) maxC = cell.col;
    }
  }

  const spanC = maxC - minC + 1;
  const totalDuration = frames.length / fps;

  const keyframesCSS = [];
  const cellStyles = [];
  const divs = [];

  for (const cellId of allCellIds) {
    const [row, col] = cellId.split('-').map(Number);
    const gridRow = row - minR + 1;
    const gridCol = col - minC + 1;
    const cls = `c-${cellId}`;

    // Build keyframe stops for this cell across frames
    const stops = [];
    for (let i = 0; i < frames.length; i++) {
      const pct = (i / frames.length) * 100;
      const endPct = ((i + 1) / frames.length) * 100;
      const cell = frames[i].cells[cellId];
      const active = cell && cell.active;
      const fill = active ? cell.fill : 'transparent';
      const opacity = active ? cell.opacity.from : 0;
      stops.push(`  ${pct.toFixed(1)}% { background: ${fill}; opacity: ${opacity}; }`);
      if (i === frames.length - 1) {
        stops.push(`  100% { background: ${fill}; opacity: ${opacity}; }`);
      }
    }

    keyframesCSS.push(`@keyframes frame-${cellId} {\n${stops.join('\n')}\n}`);
    cellStyles.push(`.${cls} { animation: frame-${cellId} ${totalDuration}s step-end infinite; }`);

    // Use first active frame for initial color
    const firstFrame = frames.find(f => f.cells[cellId]?.active);
    const initFill = firstFrame ? firstFrame.cells[cellId].fill : 'transparent';
    divs.push(
      `  <div class="pixel-cell ${cls}" style="grid-row:${gridRow};grid-column:${gridCol};background:${initFill};"></div>`
    );
  }

  const styleBlock = [
    `.pixel-grid { display: grid; grid-template-columns: repeat(${spanC}, ${CELL_PX}px); gap: ${GAP_PX}px; }`,
    `.pixel-cell { border-radius: 2px; width: ${CELL_PX}px; height: ${CELL_PX}px; }`,
    ...keyframesCSS,
    ...cellStyles,
  ].join('\n    ');

  return `<div class="pixel-grid">
  <style>
    ${styleBlock}
  </style>
${divs.join('\n')}
</div>`;
}
