import { useMemo } from 'react';
import { PRESETS } from '../utils/presets.js';
import { generateSVG } from '../utils/svgGenerator.js';
import './LandingPage.css';

/* ── Pixel font: 5 rows × 4 cols per letter ── */
const LETTERS = {
  P: [[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  I: [[1,1,1,0],[0,1,0,0],[0,1,0,0],[0,1,0,0],[1,1,1,0]],
  X: [[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,0,0,1]],
  C: [[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  O: [[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  N: [[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1]],
};

const WORD = 'PIXICON';
const LETTER_W = 4;
const GAP_W = 1;
const ROWS = 5;

const COLORS = [
  '#6366f1', '#6366f1', '#818cf8',
  '#a78bfa', '#c084fc', '#c084fc', '#ec4899',
];

function buildPixelGrid() {
  const chars = WORD.split('');
  const totalCols = chars.length * LETTER_W + (chars.length - 1) * GAP_W;
  const cells = [];

  for (let r = 0; r < ROWS; r++) {
    for (let li = 0; li < chars.length; li++) {
      const letter = LETTERS[chars[li]];
      const colOff = li * (LETTER_W + GAP_W);
      for (let c = 0; c < LETTER_W; c++) {
        const active = letter[r][c] === 1;
        const gc = colOff + c;
        cells.push({
          active,
          color: COLORS[li],
          delay: (r + gc) * 30,
        });
      }
      if (li < chars.length - 1) {
        cells.push({ active: false, color: null, delay: 0 });
      }
    }
  }
  return { cells, totalCols };
}

const POSITIONS = [
  { top: '8%', left: '8%', size: 120 },
  { top: '12%', right: '10%', size: 100 },
  { bottom: '18%', left: '12%', size: 80 },
  { bottom: '10%', right: '8%', size: 90 },
  { top: '48%', left: '4%', size: 70 },
  { top: '38%', right: '5%', size: 65 },
];

const GLOWS = [
  'rgba(99,102,241,0.3)',
  'rgba(236,72,153,0.3)',
  'rgba(34,197,94,0.3)',
  'rgba(59,130,246,0.3)',
  'rgba(99,102,241,0.2)',
  'rgba(239,68,68,0.3)',
];

export default function LandingPage({ setView }) {
  const pixelGrid = useMemo(() => buildPixelGrid(), []);

  const presetSVGs = useMemo(() => {
    return PRESETS.map((preset, i) => {
      const { cells, gridSize } = preset.fn();
      const slug = preset.name.toLowerCase().replace(/\s+/g, '-');
      const svg = generateSVG(cells, gridSize, `lp-${slug}`);
      return {
        name: preset.name,
        svg,
        pos: POSITIONS[i],
        glow: GLOWS[i],
      };
    });
  }, []);

  function openEditor() {
    window.history.replaceState(null, '', '?editor');
    setView('editor');
  }

  function openGallery() {
    window.history.replaceState(null, '', '?icon=');
    setView('gallery');
  }

  return (
    <div className="landing-page">
      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />

        <div className="landing-hero-presets">
          {presetSVGs.map((p, i) => (
            <div
              key={p.name}
              className={`landing-preset-float landing-preset-float-${i}`}
              style={{
                top: p.pos.top,
                bottom: p.pos.bottom,
                left: p.pos.left,
                right: p.pos.right,
                width: p.pos.size,
                height: p.pos.size,
                filter: `drop-shadow(0 0 24px ${p.glow})`,
              }}
              dangerouslySetInnerHTML={{ __html: p.svg }}
            />
          ))}
        </div>

        <div className="landing-hero-content">
          <div
            className="pixel-logo"
            style={{ gridTemplateColumns: `repeat(${pixelGrid.totalCols}, 1fr)` }}
          >
            {pixelGrid.cells.map((cell, i) => (
              <div
                key={i}
                className={`pixel-logo-cell${cell.active ? ' active' : ''}`}
                style={cell.active ? {
                  backgroundColor: cell.color,
                  '--d': `${cell.delay}ms`,
                } : undefined}
              />
            ))}
          </div>

          <h1 className="landing-tagline">Pixel grids that move.</h1>
          <p className="landing-subtitle">
            Build animated SVG icons, one cell at a time.<br />
            Paint. Animate. Export. Ship.
          </p>

          <button className="landing-cta" onClick={openEditor}>
            Open the editor
          </button>
          <br />
          <button className="landing-secondary" onClick={openGallery}>
            or explore the gallery
          </button>
        </div>
      </section>

      {/* ── PRESET STRIP ── */}
      <section className="landing-presets-strip">
        <p className="landing-presets-heading">Built-in presets</p>
        <div className="landing-presets-row">
          {presetSVGs.map((p) => (
            <div key={p.name} className="landing-presets-item">
              <div
                className="landing-presets-item-preview"
                dangerouslySetInnerHTML={{ __html: p.svg }}
              />
              <span className="landing-presets-item-label">{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CLI TEASER ── */}
      <section className="landing-cli">
        <p className="landing-cli-heading">For the terminal-minded</p>
        <pre className="landing-cli-code">
          <span className="cli-prompt">$ </span>
          <span className="cli-cmd">pixicon</span>{' grid create '}
          <span className="cli-flag">--data</span>
          <span className="cli-string">{" '{\"rows\":8,\"cols\":8}'"}</span>
          <span className="cli-pipe">{' \\\n  | '}</span>
          <span className="cli-cmd">pixicon</span>{' cells fill-pattern '}
          <span className="cli-flag">--data</span>
          <span className="cli-string">{" '{\"pattern\":\"circle\",\"props\":{\"fill\":\"#6366f1\",\"active\":true}}'"}</span>
          <span className="cli-pipe">{' \\\n  | '}</span>
          <span className="cli-cmd">pixicon</span>{' anim stagger '}
          <span className="cli-flag">--data</span>
          <span className="cli-string">{" '{\"pattern\":\"radial\",\"totalTime\":1.2}'"}</span>
          <span className="cli-pipe">{' \\\n  | '}</span>
          <span className="cli-cmd">pixicon</span>{' export svg '}
          <span className="cli-output">&gt; icon.svg</span>
        </pre>
        <p className="landing-cli-sub">
          Pipe-based CLI for scripting and AI-driven icon generation.
        </p>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        Pixicon &mdash; pixel grid animation editor
      </footer>
    </div>
  );
}
