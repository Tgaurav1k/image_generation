import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Trash2, CheckSquare } from 'lucide-react';
import Button from '../common/Button';
import { formatDate, formatFileSize } from '../../utils/formatters';

export default function ImageDetailPanel({ image, onClose, onDownload, onDelete, onSelect }) {
  if (!image) return null;

  const imgSrc = image.data
    ? `data:image/png;base64,${image.data}`
    : `/api/images/${image.id}/data`;

  return (
    <AnimatePresence>
      {image && (
        <>
          {/* Mobile overlay backdrop */}
          <motion.div
            className="md:hidden fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="glass-elevated"
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 51,
              width: 340, maxWidth: '100vw',
              display: 'flex', flexDirection: 'column',
              borderLeft: '1px solid var(--border-strong)',
              boxShadow: 'var(--shadow-lg)',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
            }}>
              <h3 style={{ fontSize: 15, fontWeight: 600 }}>Image Details</h3>
              <button
                onClick={onClose}
                aria-label="Close detail panel"
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 4, borderRadius: 'var(--radius-sm)',
                  transition: 'color var(--duration-fast) var(--ease-out)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Image Preview */}
            <div style={{ padding: 20 }}>
              <div style={{
                borderRadius: 'var(--radius-lg)', overflow: 'hidden',
                background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
              }}>
                <img
                  src={imgSrc}
                  alt={image.prompt || 'Generated image'}
                  style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: 280 }}
                />
              </div>
            </div>

            {/* Metadata */}
            <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {image.prompt && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Prompt</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{image.prompt}</div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {(image.width || image.height) && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Dimensions</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{image.width}×{image.height}</div>
                  </div>
                )}
                {image.file_size && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Size</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{formatFileSize(image.file_size)}</div>
                  </div>
                )}
                {image.created_at && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>Created</div>
                    <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{formatDate(image.created_at)}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{
              marginTop: 'auto', padding: 20,
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              {onDownload && (
                <Button variant="primary" onClick={() => onDownload(image)} style={{ width: '100%' }}>
                  <Download size={16} /> Download
                </Button>
              )}
              {onSelect && (
                <Button variant="secondary" onClick={() => onSelect(image)} style={{ width: '100%' }}>
                  <CheckSquare size={16} /> Select for Download
                </Button>
              )}
              {onDelete && (
                <Button variant="danger" onClick={() => onDelete(image)} style={{ width: '100%' }}>
                  <Trash2 size={16} /> Delete
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
