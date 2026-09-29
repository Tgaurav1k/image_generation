import { useState } from 'react';

export default function Button({ children, variant = 'primary', disabled, className = '', style: styleProp, ...props }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    padding: '10px 16px', borderRadius: 'var(--radius-md)',
    fontSize: 14, fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    opacity: disabled ? 0.4 : 1,
    outline: 'none',
    transition: 'all var(--duration-fast) var(--ease-out)',
    transform: !disabled && pressed ? 'translateY(0)' : !disabled && hovered ? 'translateY(-1px)' : 'translateY(0)',
    filter: !disabled && pressed ? 'brightness(0.95)' : !disabled && hovered ? 'brightness(1.1)' : 'brightness(1)',
  };

  const variants = {
    primary: {
      background: 'var(--accent-sage)', color: 'var(--text-inverse)',
      boxShadow: !disabled && hovered ? 'var(--shadow-glow-sage)' : 'none',
    },
    secondary: {
      background: 'transparent', color: 'var(--text-primary)',
      border: '1px solid var(--glass-border)',
    },
    danger: {
      background: 'rgba(224,100,90,0.15)', color: 'var(--status-error)',
      border: '1px solid rgba(224,100,90,0.3)',
    },
    ghost: {
      background: hovered && !disabled ? 'var(--glass-hover)' : 'transparent',
      color: hovered && !disabled ? 'var(--text-primary)' : 'var(--text-secondary)',
      border: 'none',
    },
  };

  return (
    <button
      disabled={disabled}
      className={className}
      style={{ ...base, ...variants[variant], ...styleProp }}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onFocus={(e) => { if (!disabled) e.target.style.outline = '2px solid var(--accent-sage)'; e.target.style.outlineOffset = '2px'; }}
      onBlur={(e) => { e.target.style.outline = 'none'; }}
      {...props}
    >
      {children}
    </button>
  );
}
