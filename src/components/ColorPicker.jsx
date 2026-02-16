import { useState } from 'react';
import { COLOR_SWATCHES } from '../constants.js';
import { PALETTES } from '../utils/palettes.js';
import './ColorPicker.css';

export default function ColorPicker({ value, onChange }) {
  const [paletteIndex, setPaletteIndex] = useState(0);
  const swatches = PALETTES[paletteIndex].colors || COLOR_SWATCHES;

  return (
    <div className="color-picker">
      <select
        className="palette-selector"
        value={paletteIndex}
        onChange={(e) => setPaletteIndex(Number(e.target.value))}
      >
        {PALETTES.map((p, i) => (
          <option key={p.name} value={i}>{p.name}</option>
        ))}
      </select>
      <div className="color-swatches">
        {swatches.map((color) => (
          <button
            key={color}
            className={`color-swatch${value === color ? ' active' : ''}`}
            style={{ backgroundColor: color }}
            onClick={() => onChange(color)}
            title={color}
          />
        ))}
      </div>
      <div className="color-custom">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <span className="color-value">{value}</span>
      </div>
    </div>
  );
}
