# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Two things:

1. **SVG Icon Builder** — a browser-based pixel grid editor for creating animated SVG icons, CSS animations, and React components. Users paint cells on a grid, assign animations (pulse, bounce, spin, etc.), tune per-cell timing/easing, and export the result as SVG, CSS/HTML, or a React component.

2. **Pixicon CLI** (`cli/`) — a command-line interface for headless, agent-driven icon creation. It wraps the same reducer and export pipeline as the web app, exposing all operations as composable JSON-in/JSON-out commands piped through stdin/stdout.

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

## CLI Architecture

**Entry point:** `cli/bin/pixicon.js` (registered as the `pixicon` bin in `package.json`).

**Shared code:** The CLI imports directly from `src/` — `gridReducer`, `buildInitialCells`, all three export generators, `staggerPatterns`, `presets`, `constants`, and `palettes`. It is a stateless wrapper: each invocation reads a JSON document from `--input <file>` or stdin, applies actions via the reducer, and writes the updated document to stdout.

**Document model (`cli/src/document.js`):** A JSON structure (`{ version, gridSize, frames, activeFrameIndex, nextFrameId, bgColor }`) that is converted to/from app state with `documentToState()` / `stateToDocument()`. `dispatch(doc, action)` and `dispatchMany(doc, actions)` apply reducer actions to a document.

**Target resolution (`cli/src/targets.js`):** Converts flexible target specs into cell ID arrays. Accepted formats: `"*all"`, `"*active"`, a single `"row-col"` string, an array of IDs, or a `{ from: [r1, c1], to: [r2, c2] }` range object.

**Patterns (`cli/src/patterns.js`):** Geometric fill patterns — `border`, `checkerboard`, `diagonal`, `cross`, `x-mark`, `circle`, `diamond`, `corners` — each returning an array of cell IDs for a given grid size.

**Error handling (`cli/src/errors.js`):** `PixiconError` class with `code`, `message`, `path`, and `details`. Serializes to JSON on stderr. Exit code 1 for data errors, 2 for usage errors.

### CLI Commands

All commands follow `pixicon <command> [verb] [--input file] [--data '{}']`.

| Command | Verbs | Purpose |
|---------|-------|---------|
| `grid` | `create`, `resize` | Create a new document or resize an existing grid (1–64 rows/cols) |
| `cells` | `set`, `clear`, `query`, `fill-rect`, `fill-pattern` | Paint, clear, query, or batch-fill cells using targets |
| `anim` | `stagger`, `preset` | Apply stagger delays (radial, spiral, etc.) or load named presets |
| `frame` | `add`, `duplicate`, `remove`, `set-active`, `list` | Multi-frame management |
| `export` | `svg`, `css`, `react`, `all` | Generate code via the same generators as the web app |
| `describe` | `animation-types`, `easing-options`, `stagger-patterns`, `presets`, `palettes`, `directions`, `fill-modes`, `cell-properties` | Return available options and defaults (schema reference) |
| `validate` | *(none)* | Validate document structure, cell bounds, and animation fields |
| `palette` | *(none)* | List all color palettes with hex swatches |

Typical pipeline: `pixicon grid create --data '{"rows":8,"cols":8}' | pixicon cells fill-pattern --data '{"pattern":"circle","props":{"active":true,"fill":"#ff0000"}}' | pixicon export svg`

## Key Conventions

- Cell IDs are always `"row-col"` strings parsed with `.split('-').map(Number)`
- Reducer actions use `type`/`payload` pattern; all cell mutations go through `updateActiveFrame()`
- Components use co-located `.css` files (e.g. `GridCell.jsx` + `GridCell.css`)
- ESLint rule: unused vars starting with uppercase or `_` are allowed (`varsIgnorePattern: '^[A-Z_]'`)
- `GridCell` is memoized with `React.memo` for render performance
