export default function ProgressBar({ progress, label }) {
  const complete = progress >= 100;

  return (
    <div>
      {label && (
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
          {label}
        </div>
      )}
      <div style={{
        height: 8, background: 'var(--bg-elevated)',
        borderRadius: 'var(--radius-full)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(progress, 100)}%`,
          background: complete
            ? 'linear-gradient(90deg, var(--status-success), var(--accent-sage))'
            : 'linear-gradient(90deg, var(--accent-sage-dim), var(--accent-sage))',
          borderRadius: 'var(--radius-full)',
          transition: 'width var(--duration-crawl) var(--ease-out)',
          position: 'relative',
          overflow: 'hidden',
          animation: complete ? 'pulse-glow 0.8s ease-out' : 'none',
        }}>
          {!complete && (
            <div style={{
              position: 'absolute', top: 0, left: '-100%', width: '60%', height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              animation: 'shimmer 1.4s infinite',
            }} />
          )}
        </div>
      </div>
    </div>
  );
}
