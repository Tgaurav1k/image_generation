import { useState } from 'react';
import { Sparkles, Minus, Plus, Wand2, Loader2 } from 'lucide-react';
import SizeSelector from './SizeSelector';
import Button from '../common/Button';
import { enhancePromptApi } from '../../services/imageService';

export default function SinglePromptForm({ onGenerate, isGenerating }) {
  const [prompt, setPrompt] = useState('');
  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [count, setCount] = useState(3);
  const [width, setWidth] = useState(512);
  const [height, setHeight] = useState(512);

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
    if (isEnhanced) setIsEnhanced(false);
  };

  const handleEnhance = async () => {
    if (!prompt.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const data = await enhancePromptApi(prompt.trim());
      setPrompt(data.enhanced || prompt.trim());
      setIsEnhanced(true);
    } catch {
      setIsEnhanced(false);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalPrompt = prompt.trim();
    if (!finalPrompt || isGenerating) return;
    onGenerate({ prompt: finalPrompt, count, width, height });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Button
          type="button"
          variant="secondary"
          disabled={!prompt.trim() || isEnhancing || isGenerating}
          onClick={handleEnhance}
        >
          {isEnhancing
            ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
            : <Wand2 size={15} />}
          {isEnhancing ? 'Enhancing...' : 'Enhance Prompt'}
        </Button>
      </div>

      <div>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
          Prompt {isEnhanced ? '(enhanced - editable)' : ''}
        </label>
        <textarea
          className="input"
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Describe the image you want to generate..."
          rows={4}
          style={{ borderRadius: 'var(--radius-lg)', fontSize: 15 }}
        />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
            Number of Images
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
        <Button type="submit" disabled={!prompt.trim() || isGenerating}>
          <Sparkles size={16} />
          Generate Images
        </Button>
      </div>
    </form>
  );
}
