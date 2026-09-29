export default function Input({ label, error, className = '', style: styleProp, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <input
        className={`input ${error ? 'error' : ''} ${className}`}
        style={styleProp}
        {...props}
      />
      {error && (
        <span style={{ fontSize: 12, color: 'var(--status-error)' }} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
