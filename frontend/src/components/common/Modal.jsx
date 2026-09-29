import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16,
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-elevated"
            style={{
              borderRadius: 'var(--radius-2xl)',
              padding: 32, width: 480, maxWidth: '90vw',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>{title}</h3>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', padding: 4, borderRadius: 'var(--radius-sm)',
                  transition: 'color var(--duration-fast) var(--ease-out)',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                <X size={20} />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
