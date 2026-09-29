import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Sparkles, Zap, Minus, Plus, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { parseExcelFile } from '../../utils/excelParser';
import SizeSelector from './SizeSelector';
import Button from '../common/Button';

function downloadSampleExcel() {
  const data = [
    ['prompt'],
    ['A golden retriever playing fetch in a sunny park with green grass'],
    ['Modern minimalist logo design for a tech startup called NovaTech'],
    ['Sunset over a mountain lake with reflections in the water'],
    ['Isometric illustration of a cozy home office with plants and a cat'],
    ['Abstract watercolor painting with blue, purple, and gold tones'],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws['!cols'] = [{ wch: 65 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Prompts');
  XLSX.writeFile(wb, 'sample_prompts.xlsx');
}

export default function ExcelUploader({ onGenerate, isGenerating }) {
  const [file, setFile] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [error, setError] = useState('');
  const [count, setCount] = useState(3);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (f) => {
    setError('');
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls'].includes(ext)) {
      setError('Please upload a valid .xlsx or .xls file');
      return;
    }
    setFile(f);
    try {
      const parsed = await parseExcelFile(f);
      if (parsed.length === 0) {
        setError('No valid prompts found in the uploaded file');
        return;
      }
      setPrompts(parsed);
    } catch {
      setError('Failed to parse Excel file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e, enhance = false) => {
    e.preventDefault();
    if (!file || prompts.length === 0 || isGenerating) return;
    onGenerate({ file, count, width, height, enhance });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent-sage)' : 'var(--glass-border)'}`,
          borderRadius: 'var(--radius-lg)', padding: 40,
          textAlign: 'center', cursor: 'pointer',
          background: dragOver ? 'rgba(124,158,138,0.05)' : 'transparent',
          transition: 'all var(--duration-fast) var(--ease-out)',
        }}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {file ? (
          <div className="flex items-center justify-center gap-2" style={{ color: 'var(--accent-sage)' }}>
            <FileSpreadsheet size={20} />
            <span style={{ fontWeight: 500 }}>{file.name}</span>
          </div>
        ) : (
          <>
            <Upload size={28} style={{ color: 'var(--text-muted)', margin: '0 auto 8px' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Drag & drop your .xlsx file here</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>or click to browse &middot; Supported: .xlsx, .xls</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); downloadSampleExcel(); }}
              style={{
                marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 'var(--radius-md)', fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: '1px solid var(--accent-sage)',
                background: 'rgba(124,158,138,0.08)', color: 'var(--accent-sage)',
                transition: 'all var(--duration-fast) var(--ease-out)',
              }}
            >
              <Download size={13} /> Download Sample Excel
            </button>
          </>
        )}
      </div>

      {error && (
        <div role="alert" style={{
          padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: 'rgba(224,100,90,0.1)', color: 'var(--status-error)',
          fontSize: 13, border: '1px solid rgba(224,100,90,0.2)',
        }}>
          {error}
        </div>
      )}

      {prompts.length > 0 && (
        <div style={{
          background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
          padding: 16, maxHeight: 180, overflow: 'auto',
        }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Preview ({prompts.length} prompts)
          </div>
          {prompts.slice(0, 5).map((p, i) => (
            <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              Row {i + 1}: "{p}"
            </div>
          ))}
          {prompts.length > 5 && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              ...and {prompts.length - 5} more
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-6">
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
            Images per prompt
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setCount(Math.max(1, count - 1))}
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)',
                background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Minus size={14} />
            </button>
            <span style={{ width: 40, textAlign: 'center', fontSize: 18, fontWeight: 600 }}>{count}</span>
            <button type="button" onClick={() => setCount(Math.min(20, count + 1))}
              style={{
                width: 32, height: 32, borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)',
                background: 'var(--bg-elevated)', color: 'var(--text-secondary)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        <SizeSelector width={width} height={height} onChange={(w, h) => { setWidth(w); setHeight(h); }} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        <Button
          variant="secondary"
          type="button"
          disabled={!file || prompts.length === 0 || isGenerating}
          onClick={(e) => handleSubmit(e, false)}
        >
          <Zap size={16} />
          Generate All
        </Button>
        <Button
          type="button"
          disabled={!file || prompts.length === 0 || isGenerating}
          onClick={(e) => handleSubmit(e, true)}
        >
          <Sparkles size={16} />
          Enhance & Generate All
        </Button>
      </div>
    </form>
  );
}
