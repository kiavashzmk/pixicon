# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An SVG Icon Builder — a browser-based pixel grid editor for creating animated SVG icons, CSS animations, and React components. Users paint cells on a grid, assign animations (pulse, bounce, spin, etc.), tune per-cell timing/easing, and export the result as SVG, CSS/HTML, or a React component.

## Commands

- `npm run dev` — Start Vite dev server with HMR
- `npm run build` — Production build to `dist/`
- `npm run lint` — ESLint (flat config, JS/JSX only)
- `npm run preview` — Serve the production build locally

No test framework is configured.

## Architecture

**Stack:** React 19 + Vite 7, plain CSS (no CSS modules, no Tailwind), no TypeScript, no router.

**State management:** All app state lives in a single `useReducer` wrapped by a generic undo/redo higher-order reducer (`src/state/undoable.js`). State is provided via two React contexts — `GridContext` (read) and `GridDispatchContext` (write) — exposed through `useGrid()` and `useGridDispatch()` hooks.

**Cell model:** The grid is a flat object keyed by `"row-col"` strings (e.g. `"3-5"`). Each cell carries `fill`, `opacity.from/to`, `scale.from/to`, `delay`, `duration`, `easing`, `animationType`, `direction`, `iterationCount`, `fillMode`, and an `active` boolean. Defaults are in `src/constants.js` (`DEFAULT_CELL`).

**Frame system:** State holds an array of frames (`state.frames`), each containing its own `cells` object. `state.cells` is a derived convenience alias pointing to `frames[activeFrameIndex].cells`. The helper `updateActiveFrame()` in `gridReducer.js` is the canonical way to mutate cells within the current frame.

**Undo/redo:** `undoable()` wraps the grid reducer, maintaining `past`/`present`/`future` arrays. Selection and view-only actions (listed in `NON_UNDOABLE`) don't push onto the undo stack. Max history is 50 entries.

**Export pipeline:** Three parallel code generators in `src/utils/` produce output from the same cell data:
- `svgGenerator.js` — inline SVG with `<style>` keyframes, positions via CSS custom properties `--tx`/`--ty`
- `cssGenerator.js` — CSS grid of `<div>`s with keyframe animations
- `reactGenerator.js` — self-contained React component with inline styles and a `size` prop

Each generator has both single-frame and multi-frame variants. Multi-frame export uses frame-stepping keyframes (opacity toggling at percentage breakpoints). `keyframeGenerator.js` has two parallel keyframe functions: `generateKeyframes()` (SVG, uses `translate(var(--tx), var(--ty))`) and `generateCSSKeyframes()` (CSS/React, uses standard transforms).

**Stagger system:** `staggerPatterns.js` computes per-cell delays based on spatial patterns (left-to-right, radial, spiral, etc.) by normalizing raw position values to a `[0, totalTime]` range.

## Key Conventions

- Cell IDs are always `"row-col"` strings parsed with `.split('-').map(Number)`
- Reducer actions use `type`/`payload` pattern; all cell mutations go through `updateActiveFrame()`
- Components use co-located `.css` files (e.g. `GridCell.jsx` + `GridCell.css`)
- ESLint rule: unused vars starting with uppercase or `_` are allowed (`varsIgnorePattern: '^[A-Z_]'`)
- `GridCell` is memoized with `React.memo` for render performance
