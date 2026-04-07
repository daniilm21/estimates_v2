import React from 'react';
import { colors } from '../tokens';

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: '#fff',
        borderRadius: 16,
        padding: '16px 16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        border: `1px solid ${colors.gray3}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface BannerProps {
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'error' | 'success' | 'customer' | 'dev';
  style?: React.CSSProperties;
}

export function Banner({ children, variant = 'info', style }: BannerProps) {
  const styles = {
    info: { bg: colors.blue2, border: colors.blue3, text: colors.blue15 },
    warning: { bg: colors.yellow2, border: colors.yellow6, text: colors.yellow13 },
    error: { bg: colors.red2, border: colors.red7, text: colors.red9 },
    success: { bg: colors.green2, border: colors.green8, text: colors.green12 },
    customer: { bg: colors.amberLight, border: colors.amber, text: colors.yellow13 },
    dev: { bg: colors.blue1, border: colors.blue3, text: colors.blue15 },
  };

  const s = styles[variant];

  return (
    <div style={{
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      color: s.text,
      lineHeight: 1.5,
      ...style,
    }}>
      {children}
    </div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  eta?: string;
  badge?: string;
  badgeColor?: string;
  ctaLabel: string;
  onCta: () => void;
  highlight?: boolean;
  wow?: string;
}

export function ActionCard({
  title,
  description,
  eta,
  badge,
  badgeColor,
  ctaLabel,
  onCta,
  highlight,
  wow,
}: ActionCardProps) {
  return (
    <div style={{
      background: highlight ? colors.blue1 : '#fff',
      border: `1.5px solid ${highlight ? colors.blue6 : colors.gray3}`,
      borderRadius: 14,
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: colors.gray15 }}>{title}</span>
        {badge && (
          <span style={{
            background: badgeColor || colors.green2,
            color: badgeColor ? '#fff' : colors.green11,
            borderRadius: 20,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: 600,
          }}>
            {badge}
          </span>
        )}
      </div>
      <p style={{ fontSize: 13, color: colors.gray9, lineHeight: 1.5 }}>{description}</p>
      {wow && (
        <div style={{
          fontSize: 13, fontWeight: 700, color: colors.green11,
          background: colors.green2, borderRadius: 8, padding: '6px 10px',
        }}>
          {wow}
        </div>
      )}
      {eta && (
        <div style={{ fontSize: 14, fontWeight: 600, color: highlight ? colors.blue10 : colors.gray13 }}>
          {eta}
        </div>
      )}
      <button
        onClick={onCta}
        style={{
          background: highlight ? colors.blue7 : colors.gray13,
          color: '#fff',
          borderRadius: 10,
          padding: '10px 16px',
          fontSize: 14,
          fontWeight: 600,
          width: '100%',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {ctaLabel}
      </button>
    </div>
  );
}
