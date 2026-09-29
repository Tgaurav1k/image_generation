import { motion } from 'framer-motion';
import { getImageUrl } from '../../services/imageService';
import { formatBytes } from '../../utils/formatters';

export default function ImageCard({ image, selected, anySelected, onToggle, onViewDetail }) {
  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      onClick={() => onViewDetail?.(image)}
      style={{
        borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        background: 'var(--glass-bg)',
        border: selected ? '2px solid var(--accent-sage)' : '1px solid var(--glass-border)',
        cursor: 'pointer', position: 'relative',
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color var(--duration-fast) var(--ease-out), box-shadow var(--duration-base) var(--ease-out)',
      }}
    >
      {/* Checkbox */}
      <div
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`absolute top-2 left-2 z-10 ${anySelected || selected ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
        style={{
          width: 22, height: 22, borderRadius: 'var(--radius-sm)',
          border: selected ? '2px solid var(--accent-sage)' : '2px solid rgba(255,255,255,0.5)',
          background: selected ? 'var(--accent-sage)' : 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity var(--duration-fast) var(--ease-out)',
          cursor: 'pointer',
        }}
      >
        {selected && <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✓</span>}
      </div>

      {selected && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(124,158,138,0.1)',
          pointerEvents: 'none', zIndex: 5,
        }} />
      )}

      <img
        src={getImageUrl(image.id)}
        alt={image.prompt}
        loading="lazy"
        style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
      />

      <div style={{ padding: '10px 12px' }}>
        <div style={{
          fontSize: 13, color: 'var(--text-secondary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {image.prompt}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {image.width} × {image.height} · {image.file_size ? formatBytes(image.file_size) : '—'}
        </div>
      </div>
    </motion.div>
  );
}
