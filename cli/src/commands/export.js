import { documentToState } from '../document.js';
import { PixiconError } from '../errors.js';
import { generateSVG, generateMultiFrameSVG } from '../../../src/utils/svgGenerator.js';
import { generateCSS, generateMultiFrameCSS } from '../../../src/utils/cssGenerator.js';
import { generateReactComponent, generateMultiFrameReact } from '../../../src/utils/reactGenerator.js';

function requireDoc(document) {
  if (!document) {
    throw new PixiconError('NO_DOCUMENT', 'export requires a document on stdin or --input', 'stdin');
  }
  if (!document.frames || !Array.isArray(document.frames)) {
    throw new PixiconError('INVALID_DOCUMENT', 'Document is missing frames array. Use "grid create" or "anim preset" to create a valid document.', 'document.frames');
  }
}

function getState(document) {
  return documentToState(document);
}

function countActiveCells(frames) {
  const seen = new Set();
  for (const frame of frames) {
    for (const [id, cell] of Object.entries(frame.cells)) {
      if (cell.active) seen.add(id);
    }
  }
  return seen.size;
}

function exportSVG(document, data) {
  const state = getState(document);
  const fps = data?.fps || 2;
  const isMulti = state.frames.length > 1;
  const code = isMulti
    ? generateMultiFrameSVG(state.frames, state.gridSize, fps)
    : generateSVG(state.cells, state.gridSize);
  return {
    format: 'svg',
    code,
    activeCellCount: countActiveCells(state.frames),
  };
}

function exportCSS(document, data) {
  const state = getState(document);
  const fps = data?.fps || 2;
  const isMulti = state.frames.length > 1;
  const code = isMulti
    ? generateMultiFrameCSS(state.frames, state.gridSize, fps)
    : generateCSS(state.cells, state.gridSize);
  return {
    format: 'css',
    code,
    activeCellCount: countActiveCells(state.frames),
  };
}

function exportReact(document, data) {
  const state = getState(document);
  const fps = data?.fps || 2;
  const isMulti = state.frames.length > 1;
  const code = isMulti
    ? generateMultiFrameReact(state.frames, state.gridSize, fps)
    : generateReactComponent(state.cells, state.gridSize);
  return {
    format: 'react',
    code,
    activeCellCount: countActiveCells(state.frames),
  };
}

export function handleExport(verb, data, document) {
  requireDoc(document);

  switch (verb) {
    case 'svg':
      return exportSVG(document, data);
    case 'css':
      return exportCSS(document, data);
    case 'react':
      return exportReact(document, data);
    case 'all':
      return {
        svg: exportSVG(document, data),
        css: exportCSS(document, data),
        react: exportReact(document, data),
      };
    default:
      throw new PixiconError('UNKNOWN_VERB', `Unknown export verb: "${verb}"`, 'command');
  }
}
