/**
 * TransferShell — shared visual wrapper for all New CX post-submit scenarios.
 * Matches the Current CX visual language: white header card, gray background,
 * Transfer Details accordion at the bottom.
 *
 * Usage:
 *   <TransferShell recipient="Rosa Mendoza 🇲🇽" amount="$300.00" ... >
 *     {/* lifecycle bar, banners, etc. *}
 *   </TransferShell>
 */

import { useState } from 'react';
import { colors } from '../tokens';

// ─── Sub-state tab strip (demo navigation within a scenario) ──────────────────
interface SubStateTab<T extends string> {
  id: T;
  label: string;
  color?: string;
  activeColor?: string;
}

interface SubStateNavProps<T extends string> {
  tabs: SubStateTab<T>[];
  active: T;
  onChange: (id: T) => void;
}

export function SubStateNav<T extends string>({ tabs, active, onChange }: SubStateNavProps<T>) {
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      marginBottom: 16,
      flexWrap: 'wrap',
    }}>
      {tabs.map(tab => {
        const isActive = active === tab.id;
        const bg = isActive ? (tab.activeColor || colors.blue7) : colors.gray2;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: isActive ? 600 : 400,
              background: bg,
              color: isActive ? '#fff' : colors.gray9,
              border: `1.5px solid ${isActive ? bg : colors.gray3}`,
              transition: 'all 0.12s',
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Transfer Details accordion ───────────────────────────────────────────────
interface TransferDetailsAccordionProps {
  rows: [string, string][];
}

export function TransferDetailsAccordion({ rows }: TransferDetailsAccordionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: `1px solid ${colors.gray3}`, marginTop: 4 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '14px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'transparent',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: colors.gray15 }}>Transfer Details</span>
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <path d="M6 9l6 6 6-6" stroke={colors.gray9} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="slide-in" style={{ paddingBottom: 16 }}>
          {rows.map(([label, val]) => (
            <div key={label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '7px 0',
              borderTop: `1px solid ${colors.gray2}`,
            }}>
              <span style={{ fontSize: 13, color: colors.gray8 }}>{label}</span>
              <span style={{ fontSize: 13, color: colors.gray13, fontWeight: 500, textAlign: 'right', maxWidth: '55%' }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Transfer header card ─────────────────────────────────────────────────────
interface TransferHeaderCardProps {
  recipient: string;
  amount: string;
  localAmount?: string;
  transferId: string;
  initiatedAt: string;
  payIn?: string;
  payOut?: string;
  isDevView?: boolean;
}

export function TransferHeaderCard({
  recipient,
  amount,
  localAmount,
  transferId,
  initiatedAt,
  payIn,
  payOut,
  isDevView,
}: TransferHeaderCardProps) {
  return (
    <div style={{
      background: '#fff',
      borderBottom: `1px solid ${colors.gray3}`,
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 19, fontWeight: 700, color: colors.gray15 }}>{recipient}</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: colors.gray15 }}>{amount}</div>
          {localAmount && <div style={{ fontSize: 13, color: colors.gray7 }}>{localAmount}</div>}
        </div>
      </div>
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 11, color: colors.gray7 }}>{isDevView ? 'Transfer ID' : 'Reference number'}</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: colors.gray15 }}>{transferId}</div>
      </div>
      {(payIn || payOut) && (
        <div style={{ fontSize: 12, color: colors.gray8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {payIn && <span>{isDevView ? 'Pay-In:' : 'Payment:'} {payIn}</span>}
          {payIn && payOut && <span>·</span>}
          {payOut && <span>{isDevView ? 'Pay-Out:' : 'Disbursement:'} {payOut}</span>}
        </div>
      )}
      <div style={{ marginTop: 4, fontSize: 11, color: colors.gray6 }}>Initiated {initiatedAt}</div>
    </div>
  );
}

// ─── Full transfer shell ──────────────────────────────────────────────────────
interface TransferShellProps {
  children: React.ReactNode;
  // header
  recipient: string;
  amount: string;
  localAmount?: string;
  transferId: string;
  initiatedAt: string;
  payIn?: string;
  payOut?: string;
  isDevView?: boolean;
  // accordion
  accordionRows?: [string, string][];
  // sub-state nav (optional — pass null to omit)
  subStateNav?: React.ReactNode;
}

export function TransferShell({
  children,
  recipient,
  amount,
  localAmount,
  transferId,
  initiatedAt,
  payIn,
  payOut,
  isDevView,
  accordionRows,
  subStateNav,
}: TransferShellProps) {
  const defaultRows: [string, string][] = [
    ['Transfer ID', transferId],
    ['Initiated', initiatedAt],
    ['You sent', amount],
    ['They receive', localAmount || 'MXN 5,241.00'],
    ['Exchange rate', '1 USD = 17.47 MXN'],
    ['Fee', '$3.99 USD'],
    ['Delivery method', 'Bank Deposit · BBVA Mexico'],
    ['Payment method', payIn || 'Debit Card'],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      {/* Sub-state nav (outside gray body, above header) */}
      {subStateNav && (
        <div style={{ padding: '0 0 12px' }}>
          {subStateNav}
        </div>
      )}

      {/* White header card */}
      <TransferHeaderCard
        recipient={recipient}
        amount={amount}
        localAmount={localAmount}
        transferId={transferId}
        initiatedAt={initiatedAt}
        payIn={payIn}
        payOut={payOut}
        isDevView={isDevView}
      />

      {/* Gray body */}
      <div style={{
        background: '#f5f6f8',
        flex: 1,
        padding: '16px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {children}

        {/* Transfer Details accordion */}
        <div style={{
          background: '#fff',
          borderRadius: 14,
          padding: '0 16px',
          border: `1px solid ${colors.gray3}`,
        }}>
          <TransferDetailsAccordion rows={accordionRows || defaultRows} />
        </div>
      </div>
    </div>
  );
}

// ─── Pill CTA button (matches Current CX) ────────────────────────────────────
export function PillButton({
  label,
  icon,
  onClick,
  variant = 'primary',
}: {
  label: string;
  icon?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}) {
  const isPrimary = variant === 'primary';
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: isPrimary ? '#263647' : '#fff',
        color: isPrimary ? '#fff' : colors.gray13,
        border: isPrimary ? 'none' : `1.5px solid ${colors.gray4}`,
        borderRadius: 28,
        padding: '15px',
        fontSize: 16,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        transition: 'opacity 0.12s',
        letterSpacing: '0.1px',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

// ─── Status label (colored inline badge) ─────────────────────────────────────
export function StatusLabel({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 16, color }}>ⓘ</span>
      <span style={{ fontSize: 14, fontWeight: 600, color }}>{text}</span>
    </div>
  );
}
