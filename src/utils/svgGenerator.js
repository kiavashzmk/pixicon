import { generateKeyframes, buildAnimationShorthand } from './keyframeGenerator.js';

const CELL_PX = 10;
const GAP_PX = 2;

export function generateSVG(cells, gridSize) {
  const activeCells = Object.values(cells).filter((c) => c.active);
  if (activeCells.length === 0) return '';

  // Determine bounding box of active cells
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  for (const c of activeCells) {
    if (c.row < minR) minR = c.row;
    if (c.row > maxR) maxR = c.row;
    if (c.col < minC) minC = c.col;
    if (c.col > maxC) maxC = c.col;
  }

  const padding = 4;
  const spanR = maxR - minR + 1;
  const spanC = maxC - minC + 1;
  const width = spanC * (CELL_PX + GAP_PX) - GAP_PX + padding * 2;
  const height = spanR * (CELL_PX + GAP_PX) - GAP_PX + padding * 2;

  // Generate keyframes & styles
  const keyframesSet = [];
  const cellStyles = [];
  const rects = [];

  for (const cell of activeCells) {
    const x = (cell.col - minC) * (CELL_PX + GAP_PX) + padding;
    const y = (cell.row - minR) * (CELL_PX + GAP_PX) + padding;
    const cx = x + CELL_PX / 2;
    const cy = y + CELL_PX / 2;

    const className = `c-${cell.id}`;

    if (cell.animationType !== 'none') {
      keyframesSet.push(generateKeyframes(cell.animationType, cell));

      const animName = `${cell.animationType}-${cell.id}`;
      cellStyles.push(
        `.${className} {
  --tx: ${cx}px;
  --ty: ${cy}px;
  animation: ${buildAnimationShorthand(animName, cell)};
  transform-origin: 0 0;
  transform: translate(${cx}px, ${cy}px);
}`
      );

      rects.push(
        `    <rect class="${className}" x="${-CELL_PX / 2}" y="${-CELL_PX / 2}" width="${CELL_PX}" height="${CELL_PX}" rx="2" fill="${cell.fill}" />`
      );
    } else {
      rects.push(
        `    <rect class="${className}" x="${x}" y="${y}" width="${CELL_PX}" height="${CELL_PX}" rx="2" fill="${cell.fill}" opacity="${cell.opacity.from}" />`
      );
    }
  }

  const style = keyframesSet.length > 0
    ? `  <style>\n${keyframesSet.join('\n')}\n${cellStyles.join('\n')}\n  </style>\n`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${style}${rects.join('\n')}
</svg>`;
}

export function generateMultiFrameSVG(frames, gridSize, fps) {
  // Collect all active cells across all frames for bounding box
  const allCellIds = new Set();
  for (const frame of frames) {
    for (const cell of Object.values(frame.cells)) {
      if (cell.active) allCellIds.add(cell.id);
    }
  }
  if (allCellIds.size === 0) return '';

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

  const padding = 4;
  const spanR = maxR - minR + 1;
  const spanC = maxC - minC + 1;
  const width = spanC * (CELL_PX + GAP_PX) - GAP_PX + padding * 2;
  const height = spanR * (CELL_PX + GAP_PX) - GAP_PX + padding * 2;
  const totalDuration = frames.length / fps;

  // One <g> group per frame, animated to show/hide sequentially
  const groups = [];
  const keyframesSet = [];
  const groupStyles = [];

  for (let fi = 0; fi < frames.length; fi++) {
    const frame = frames[fi];
    const activeCells = Object.values(frame.cells).filter(c => c.active);
    const rects = [];

    for (const cell of activeCells) {
      const x = (cell.col - minC) * (CELL_PX + GAP_PX) + padding;
      const y = (cell.row - minR) * (CELL_PX + GAP_PX) + padding;
      rects.push(
        `      <rect x="${x}" y="${y}" width="${CELL_PX}" height="${CELL_PX}" rx="2" fill="${cell.fill}" opacity="${cell.opacity.from}" />`
      );
    }

    groups.push(`    <g class="frame-${fi}">\n${rects.join('\n')}\n    </g>`);

    // Build keyframe for this group: visible only during its time slice
    const startPct = (fi / frames.length) * 100;
    const endPct = ((fi + 1) / frames.length) * 100;
    keyframesSet.push(
      `@keyframes show-frame-${fi} {
  0% { opacity: 0; }
  ${startPct.toFixed(1)}% { opacity: 1; }
  ${endPct.toFixed(1)}% { opacity: 0; }
  100% { opacity: 0; }
}`
    );
    groupStyles.push(
      `.frame-${fi} { opacity: 0; animation: show-frame-${fi} ${totalDuration}s step-end infinite; }`
    );
  }

  const style = `  <style>\n${keyframesSet.join('\n')}\n${groupStyles.join('\n')}\n  </style>\n`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${style}${groups.join('\n')}
</svg>`;
}
