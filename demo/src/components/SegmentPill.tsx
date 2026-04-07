import { useState } from 'react';
import { type SegmentState } from '../types';
import { colors } from '../tokens';

interface SegmentPillProps {
  label: string;
  devLabel?: string;
  state: SegmentState;
  subLabel?: string;
  isDevView?: boolean;
  onClick?: () => void;
  flexGrow?: number;
  tooltip?: string;
}

function getSegmentStyle(state: SegmentState): {
  bg: string;
  textColor: string;
  border: string;
  isPulsing: boolean;
} {
  switch (state) {
    case 'pending':
      return { bg: colors.gray2, textColor: colors.gray8, border: colors.gray4, isPulsing: false };
    case 'active-remitly':
      return { bg: colors.blue7, textColor: '#fff', border: colors.blue8, isPulsing: true };
    case 'active-customer':
      return { bg: colors.amberLight, textColor: colors.yellow13, border: colors.amber, isPulsing: false };
    case 'on-track':
      return { bg: colors.green2, textColor: colors.green12, border: colors.green9, isPulsing: false };
    case 'yellow-delay':
      return { bg: colors.yellow2, textColor: colors.yellow13, border: colors.yellow8, isPulsing: false };
    case 'red-delay':
      return { bg: colors.red2, textColor: colors.red9, border: colors.red8, isPulsing: false };
    case 'uncertain':
      return { bg: colors.yellow2, textColor: colors.yellow13, border: colors.yellow7, isPulsing: true };
    case 'completed':
      return { bg: colors.green2, textColor: colors.green12, border: colors.green9, isPulsing: false };
    case 'delivered':
      return { bg: colors.green9, textColor: '#fff', border: colors.green10, isPulsing: false };
    default:
      return { bg: colors.gray2, textColor: colors.gray8, border: colors.gray4, isPulsing: false };
  }
}

function getStateIcon(state: SegmentState): string {
  switch (state) {
    case 'pending': return '○';
    case 'active-remitly': return '●';
    case 'active-customer': return '⊙';
    case 'on-track': return '✓';
    case 'yellow-delay': return '⚠';
    case 'red-delay': return '⚠';
    case 'uncertain': return '?';
    case 'completed': return '✓';
    case 'delivered': return '🎉';
    default: return '○';
  }
}

export function SegmentPill({
  label,
  devLabel,
  state,
  subLabel,
  isDevView,
  onClick,
  flexGrow = 1,
  tooltip,
}: SegmentPillProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const { bg, textColor, border, isPulsing } = getSegmentStyle(state);
  const displayLabel = isDevView && devLabel ? devLabel : label;
  const icon = getStateIcon(state);
  const isClickable = !!onClick || !!tooltip;

  return (
    <div
      style={{ flex: flexGrow, minWidth: 0, position: 'relative' }}
      onMouseEnter={() => tooltip && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        onClick={onClick}
        className={isPulsing ? 'pulse-animation' : undefined}
        style={{
          background: bg,
          border: `1.5px solid ${border}`,
          borderRadius: 20,
          padding: '6px 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          cursor: isClickable ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 12, color: textColor }}>{icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: textColor, whiteSpace: 'nowrap' }}>
            {displayLabel}
          </span>
        </div>
        {subLabel && (
          <span style={{ fontSize: 12, color: textColor, opacity: 0.8, textAlign: 'center' }}>
            {subLabel}
          </span>
        )}
      </div>
      {showTooltip && tooltip && (
        <div
          className="slide-in"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: colors.gray14,
            color: '#fff',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: 12,
            width: 200,
            lineHeight: 1.4,
            zIndex: 100,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {tooltip}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: `6px solid ${colors.gray14}`,
          }} />
        </div>
      )}
    </div>
  );
}
