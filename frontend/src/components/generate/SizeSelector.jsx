import { useState } from 'react';

const PRESETS = [
  { label: '512 × 512',   ratio: '1:1',  w: 512,  h: 512  },
  { label: '1024 × 1024', ratio: '1:1',  w: 1024, h: 1024 },
  { label: '1024 × 768',  ratio: '4:3',  w: 1024, h: 768  },
  { label: '768 × 1024',  ratio: '3:4',  w: 768,  h: 1024 },
  { label: '1024 × 576',  ratio: '16:9', w: 1024, h: 576  },
  { label: '1280 × 720',  ratio: '16:9', w: 1280, h: 720  },
  { label: '576 × 1024',  ratio: '9:16', w: 576,  h: 1024 },
  { label: '720 × 1280',  ratio: '9:16', w: 720,  h: 1280 },
  { label: '1024 × 672',  ratio: '3:2',  w: 1024, h: 672  },
  { label: '672 × 1024',  ratio: '2:3',  w: 672,  h: 1024 },
];

const sanitizeSize = (v) => {
  const rounded = Math.round(v / 16) * 16;
  return Math.min(Math.max(rounded, 512), 2048);
};

export default function SizeSelector({ width, height, onChange }) {
  const [mode, setMode] = useState('preset');

  const isActive = (s) => mode === 'preset' && s.w === width && s.h === height;

  const btnBase = {
    padding: '7px 12px', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 500,
    cursor: 'pointer', transition: 'all var(--duration-fast) var(--ease-out)',
    border: '1px solid var(--glass-border)', background: 'var(--bg-elevated)', color: 'var(--text-secondary)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, lineHeight: 1.3,
  };
  const btnActive = {
    ...btnBase,
    border: '1px solid var(--accent-sage)', background: 'rgba(124,158,138,0.12)', color: 'var(--accent-sage)',
  };

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
        Image Size
      </label>

      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <button type="button" onClick={() => setMode('preset')}
          style={mode === 'preset'
            ? { ...btnBase, border: '1px solid var(--accent-sage)', background: 'rgba(124,158,138,0.12)', color: 'var(--accent-sage)', flexDirection: 'row' }
            : { ...btnBase, flexDirection: 'row' }
          }>
          Presets
        </button>
        <button type="button" onClick={() => setMode('custom')}
          style={mode === 'custom'
            ? { ...btnBase, border: '1px solid var(--accent-sage)', background: 'rgba(124,158,138,0.12)', color: 'var(--accent-sage)', flexDirection: 'row' }
            : { ...btnBase, flexDirection: 'row' }
          }>
          Custom
        </button>
      </div>

      {mode === 'preset' && (
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((s) => (
            <button
              key={`${s.w}x${s.h}`}
              type="button"
              onClick={() => onChange(s.w, s.h)}
              style={isActive(s) ? btnActive : btnBase}
            >
              <span style={{ fontSize: 11, opacity: 0.7 }}>{s.ratio}</span>
              <span>{s.w} × {s.h}</span>
            </button>
          ))}
        </div>
      )}

      {mode === 'custom' && (
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex items-center gap-2">
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>W</label>
            <input
              className="input"
              type="number" min={512} max={2048} step={16} value={width}
              onBlur={(e) => onChange(sanitizeSize(parseInt(e.target.value) || 512), height)}
              onChange={(e) => onChange(parseInt(e.target.value) || 512, height)}
              style={{ width: 80, padding: '6px 10px', fontSize: 13, borderRadius: 'var(--radius-sm)' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <label style={{ fontSize: 12, color: 'var(--text-muted)' }}>H</label>
            <input
              className="input"
              type="number" min={512} max={2048} step={16} value={height}
              onBlur={(e) => onChange(width, sanitizeSize(parseInt(e.target.value) || 512))}
              onChange={(e) => onChange(width, parseInt(e.target.value) || 512)}
              style={{ width: 80, padding: '6px 10px', fontSize: 13, borderRadius: 'var(--radius-sm)' }}
            />
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Min 512, max 2048, multiples of 16
          </span>
        </div>
      )}
    </div>
  );
}
