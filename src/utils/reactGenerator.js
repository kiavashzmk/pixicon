import { generateCSSKeyframes, buildAnimationShorthand } from './keyframeGenerator.js';

export function generateReactComponent(cells, gridSize) {
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

  const keyframesArr = [];
  const cellStylesArr = [];
  const hasAnimations = activeCells.some(c => c.animationType !== 'none');

  for (const cell of activeCells) {
    if (cell.animationType !== 'none') {
      keyframesArr.push(generateCSSKeyframes(cell.animationType, cell));
      const animName = `${cell.animationType}-${cell.id}`;
      cellStylesArr.push(
        `.c-${cell.id} { animation: ${buildAnimationShorthand(animName, cell)}; transform-origin: center; }`
      );
    }
  }

  const divLines = activeCells.map(cell => {
    const gridRow = cell.row - minR + 1;
    const gridCol = cell.col - minC + 1;
    const opacity = cell.animationType === 'none' ? `, opacity: ${cell.opacity.from}` : '';
    const cls = cell.animationType !== 'none' ? `className="c-${cell.id}" ` : '';
    return `      <div ${cls}style={{ gridRow: ${gridRow}, gridColumn: ${gridCol}, background: '${cell.fill}', borderRadius: \`\${2 * size}px\`, width: \`\${cellPx}px\`, height: \`\${cellPx}px\`${opacity} }} />`;
  });

  const keyframesDecl = hasAnimations
    ? `const keyframesCSS = \`\n${[...keyframesArr, ...cellStylesArr].join('\n')}\n\`;\n\n`
    : '';

  const styleTag = hasAnimations
    ? '\n      {keyframesCSS && <style>{keyframesCSS}</style>}'
    : '';

  return `${keyframesDecl}export default function PixelGrid({ size = 1 }) {
  const cellPx = 10 * size;
  const gapPx = 2 * size;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: \`repeat(${spanC}, \${cellPx}px)\`, gap: \`\${gapPx}px\` }}>${styleTag}
${divLines.join('\n')}
    </div>
  );
}
`;
}

export function generateMultiFrameReact(frames, gridSize, fps) {
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

  const spanC = maxC - minC + 1;
  const totalDuration = frames.length / fps;

  const keyframesArr = [];
  const cellStylesArr = [];

  for (const cellId of allCellIds) {
    const stops = [];
    for (let i = 0; i < frames.length; i++) {
      const pct = (i / frames.length) * 100;
      const cell = frames[i].cells[cellId];
      const active = cell && cell.active;
      const fill = active ? cell.fill : 'transparent';
      const opacity = active ? cell.opacity.from : 0;
      stops.push(`  ${pct.toFixed(1)}% { background: ${fill}; opacity: ${opacity}; }`);
      if (i === frames.length - 1) {
        stops.push(`  100% { background: ${fill}; opacity: ${opacity}; }`);
      }
    }
    keyframesArr.push(`@keyframes frame-${cellId} {\n${stops.join('\n')}\n}`);
    cellStylesArr.push(`.c-${cellId} { animation: frame-${cellId} ${totalDuration}s step-end infinite; }`);
  }

  const divLines = [];
  for (const cellId of allCellIds) {
    const [row, col] = cellId.split('-').map(Number);
    const gridRow = row - minR + 1;
    const gridCol = col - minC + 1;
    const firstFrame = frames.find(f => f.cells[cellId]?.active);
    const initFill = firstFrame ? firstFrame.cells[cellId].fill : 'transparent';
    divLines.push(
      `      <div className="c-${cellId}" style={{ gridRow: ${gridRow}, gridColumn: ${gridCol}, background: '${initFill}', borderRadius: \`\${2 * size}px\`, width: \`\${cellPx}px\`, height: \`\${cellPx}px\` }} />`
    );
  }

  return `const keyframesCSS = \`\n${[...keyframesArr, ...cellStylesArr].join('\n')}\n\`;

export default function PixelGrid({ size = 1 }) {
  const cellPx = 10 * size;
  const gapPx = 2 * size;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: \`repeat(${spanC}, \${cellPx}px)\`, gap: \`\${gapPx}px\` }}>
      <style>{keyframesCSS}</style>
${divLines.join('\n')}
    </div>
  );
}
`;
}
