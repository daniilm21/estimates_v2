import React from 'react';

interface SelectCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  detail?: string;
  tag?: string;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

/**
 * Matches Remitly's SelectPaymentCard / SelectButton visual pattern:
 * - 1px gray border normally, 3px blue on selection
 * - Icon (40×40) + title + secondary text + radio circle
 */
export function SelectCard({
  icon,
  title,
  subtitle,
  detail,
  tag,
  selected,
  disabled,
  onSelect,
}: SelectCardProps) {
  return (
    <button
      onClick={disabled ? undefined : onSelect}
      style={{
        width: '100%',
        background: '#fff',
        border: `${selected ? 3 : 1}px solid ${selected ? '#226ba4' : '#425263'}`,
        borderRadius: 12,
        padding: selected ? 13 : 15, // compensate for thicker border
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        textAlign: 'left',
        transition: 'border-color 0.12s, border-width 0.08s',
      }}
    >
      {/* Left icon */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 10,
        background: selected ? '#d2ecff' : '#f3f4f7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        flexShrink: 0,
        transition: 'background 0.12s',
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {tag && (
          <div style={{
            display: 'inline-block',
            background: '#d2ecff',
            color: '#226ba4',
            borderRadius: 4,
            padding: '1px 6px',
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 3,
          }}>
            {tag}
          </div>
        )}
        <div style={{
          fontWeight: 700,
          fontSize: 16,
          color: '#09192a',
          lineHeight: 1.2,
          marginBottom: subtitle ? 3 : 0,
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: '#607081', lineHeight: 1.4 }}>
            {subtitle}
          </div>
        )}
        {detail && (
          <div style={{ fontSize: 12, color: '#8696a7', marginTop: 2 }}>
            {detail}
          </div>
        )}
      </div>

      {/* Radio */}
      <div style={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: `2px solid ${selected ? '#226ba4' : '#97a7b8'}`,
        background: selected ? '#226ba4' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.12s',
      }}>
        {selected && (
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#fff',
          }} />
        )}
      </div>
    </button>
  );
}

interface PrimaryButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function PrimaryButton({ label, onClick, disabled, loading }: PrimaryButtonProps) {
  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      style={{
        width: '100%',
        background: disabled ? '#97a7b8' : '#226ba4',
        color: '#fff',
        border: 'none',
        borderRadius: 12,
        padding: '15px',
        fontSize: 17,
        fontWeight: 700,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.12s',
        letterSpacing: '0.1px',
      }}
      onMouseEnter={e => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {loading ? '✓ Sending...' : label}
    </button>
  );
}

interface SectionHeaderProps {
  children: React.ReactNode;
}

export function SectionHeader({ children }: SectionHeaderProps) {
  return (
    <div style={{
      fontSize: 16,
      fontWeight: 700,
      color: '#09192a',
      marginBottom: 12,
    }}>
      {children}
    </div>
  );
}
