import { useState } from 'react';
import { type PayInMethod, type PayOutMethod } from '../types';
import { colors } from '../tokens';

type SendFlowScreen = 'calculator' | 'summary';

interface CurrentCXSendFlowProps {
  onSubmit: (scenario: 'happy' | 'push-funds') => void;
  screen: SendFlowScreen;
  onScreenChange: (s: SendFlowScreen) => void;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const PAY_OUT_OPTIONS: { value: PayOutMethod; label: string; sublabel: string }[] = [
  { value: 'bank-deposit',  label: 'Bank or Debit Card Deposit', sublabel: 'BBVA Mexico' },
  { value: 'mobile-wallet', label: 'Mobile Wallet',              sublabel: 'Various providers' },
  { value: 'cash-pickup',   label: 'Cash Pickup',                sublabel: 'Various locations' },
  { value: 'push-to-card',  label: 'Push to Card',               sublabel: 'Visa/Mastercard debit' },
];

const PAY_IN_OPTIONS: { value: PayInMethod; label: string }[] = [
  { value: 'debit-card', label: 'Debit Card' },
  { value: 'ach',        label: 'Bank Account' },
  { value: 'push-funds', label: 'Wire Transfer' },
];

const ESTIMATE_TEXT: Record<PayOutMethod, Record<PayInMethod, string>> = {
  'bank-deposit':  { 'debit-card': 'Delivers in 4 hours',         'ach': 'Delivers in 1 to 2 days',  'push-funds': 'Delivers in 4h after wire' },
  'mobile-wallet': { 'debit-card': 'Delivers in 1 hour',          'ach': 'Delivers in 1 to 2 days',  'push-funds': 'Delivers in 1h after wire' },
  'cash-pickup':   { 'debit-card': 'Delivers in 30 minutes',      'ach': 'Delivers in 1 to 2 days',  'push-funds': 'Delivers in 30 min after wire' },
  'push-to-card':  { 'debit-card': 'Delivers in about 10 minutes','ach': 'Delivers in 1 business day','push-funds': 'Delivers in 10 min after wire' },
};

const FEE_ROWS: Record<PayInMethod, { label: string; amount: string; color?: string }[]> = {
  'debit-card': [
    { label: 'Flat fee', amount: '3.99 USD' },
    { label: 'Total', amount: '303.99 USD' },
  ],
  'ach': [
    { label: 'Flat fee', amount: '1.99 USD' },
    { label: 'Total', amount: '301.99 USD' },
  ],
  'push-funds': [
    { label: 'No transfer fee', amount: '0.00 USD', color: colors.green11 },
    { label: 'Total', amount: '300.00 USD' },
  ],
};

// Point-in-time estimates for the summary screen
type SummaryEst = { headline: string; fullDate: string; countdown: string };
const SUMMARY_EST: Record<PayOutMethod, Record<PayInMethod, SummaryEst>> = {
  'bank-deposit': {
    'debit-card': { headline: 'Delivers in 4 hours', fullDate: 'Wednesday, 3 April 2026 at 6:30 PM', countdown: '~4 hours from now' },
    'ach':        { headline: 'Delivers in 2 business days', fullDate: 'Friday, 5 April 2026', countdown: '~2 business days' },
    'push-funds': { headline: 'Delivers 4h after wire receipt', fullDate: 'after your wire is received', countdown: '4h after wire' },
  },
  'mobile-wallet': {
    'debit-card': { headline: 'Delivers in 1 hour', fullDate: 'Wednesday, 3 April 2026 at 3:30 PM', countdown: '~1 hour from now' },
    'ach':        { headline: 'Delivers in 2 business days', fullDate: 'Friday, 5 April 2026', countdown: '~2 business days' },
    'push-funds': { headline: 'Delivers 1h after wire receipt', fullDate: 'after your wire is received', countdown: '1h after wire' },
  },
  'cash-pickup': {
    'debit-card': { headline: 'Delivers in 30 minutes', fullDate: 'Wednesday, 3 April 2026 at 3:00 PM', countdown: '~30 minutes from now' },
    'ach':        { headline: 'Delivers in 2 business days', fullDate: 'Friday, 5 April 2026', countdown: '~2 business days' },
    'push-funds': { headline: 'Delivers 30 min after wire receipt', fullDate: 'after your wire is received', countdown: '30 min after wire' },
  },
  'push-to-card': {
    'debit-card': { headline: 'Delivers in about 10 minutes', fullDate: 'Wednesday, 3 April 2026 at 2:40 PM', countdown: '~10 minutes from now' },
    'ach':        { headline: 'Delivers in 1 business day', fullDate: 'Thursday, 4 April 2026', countdown: '~1 business day' },
    'push-funds': { headline: 'Delivers 10 min after wire receipt', fullDate: 'after your wire is received', countdown: '10 min after wire' },
  },
};

const PAY_OUT_LABELS: Record<PayOutMethod, string> = {
  'bank-deposit':  'Bank Deposit · BBVA Mexico',
  'mobile-wallet': 'Mobile Wallet',
  'cash-pickup':   'Cash Pickup',
  'push-to-card':  'Push to Card · Visa Direct',
};

const PAY_IN_LABELS: Record<PayInMethod, string> = {
  'debit-card': 'Debit Card',
  'ach':        'Bank Account (ACH)',
  'push-funds': 'Wire Transfer',
};

const PAY_OUT_ICON: Record<PayOutMethod, { emoji: string; bg: string }> = {
  'bank-deposit':  { emoji: '🏦', bg: '#263647' },
  'mobile-wallet': { emoji: '📱', bg: '#6c4bc6' },
  'cash-pickup':   { emoji: '💵', bg: '#2a7d4f' },
  'push-to-card':  { emoji: '⚡', bg: '#c67c0a' },
};

const PAY_IN_ICON: Record<PayInMethod, { emoji: string; bg: string }> = {
  'debit-card': { emoji: '💳', bg: '#226ba4' },
  'ach':        { emoji: '🏦', bg: '#0e7490' },
  'push-funds': { emoji: '📤', bg: '#64748b' },
};

// ─── Dropdown row ─────────────────────────────────────────────────────────────

function DropdownRow({
  label, value, sublabel, options, onSelect, open, onToggle,
}: {
  label: string; value: string; sublabel?: string;
  options: { label: string; sublabel?: string; value: string }[];
  onSelect: (v: string) => void; open: boolean; onToggle: () => void;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, color: colors.gray9, marginBottom: 6 }}>{label}</div>
      <button
        onClick={onToggle}
        style={{ width: '100%', background: '#fff', border: `1px solid ${colors.gray4}`, borderRadius: 10, padding: '13px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}
      >
        <div>
          <div style={{ fontSize: 16, fontWeight: 500, color: colors.gray15 }}>{value}</div>
          {sublabel && <div style={{ fontSize: 13, color: colors.gray8, marginTop: 1 }}>{sublabel}</div>}
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" stroke={colors.gray9} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="slide-in" style={{ border: `1px solid ${colors.gray4}`, borderTop: 'none', borderRadius: '0 0 10px 10px', overflow: 'hidden', marginTop: -1 }}>
          {options.map((opt, i) => (
            <button
              key={opt.value}
              onClick={() => { onSelect(opt.value); onToggle(); }}
              style={{ width: '100%', padding: '12px 14px', textAlign: 'left', background: opt.value === value ? colors.blue2 : '#fff', borderTop: i > 0 ? `1px solid ${colors.gray3}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontSize: 15, color: colors.gray15, fontWeight: opt.value === value ? 600 : 400 }}>{opt.label}</div>
                {opt.sublabel && <div style={{ fontSize: 12, color: colors.gray8 }}>{opt.sublabel}</div>}
              </div>
              {opt.value === value && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="#226ba4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Send Summary (Current CX) ────────────────────────────────────────────────

function SendSummary({
  payIn, payOut, onSubmit, onBack,
}: { payIn: PayInMethod; payOut: PayOutMethod; onSubmit: () => void; onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const est = SUMMARY_EST[payOut][payIn];
  const feeRow = FEE_ROWS[payIn][0];
  const totalRow = FEE_ROWS[payIn][1];
  const payOutIcon = PAY_OUT_ICON[payOut];
  const payInIcon = PAY_IN_ICON[payIn];

  const handleSend = () => {
    setSubmitted(true);
    setTimeout(onSubmit, 600);
  };

  const summaryRows: { label: string; value: string; bold?: boolean; valueColor?: string }[] = [
    { label: 'Amount to send', value: '$300.00 USD' },
    { label: 'Transfer fee', value: feeRow.amount, valueColor: feeRow.color },
    { label: 'Total cost', value: totalRow.amount, bold: true },
    { label: 'Recipient fees', value: 'No fees', valueColor: colors.green11 },
    { label: 'Total to recipient', value: 'MXN 5,241.00' },
  ];

  return (
    <div style={{ background: '#fff', display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* Recipient header */}
      <div style={{ padding: '24px 20px 20px', textAlign: 'center', borderBottom: `1px solid ${colors.gray3}` }}>
        <div style={{
          width: 56, height: 56, background: colors.gray5, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 10px', fontSize: 18, fontWeight: 700, color: '#fff',
        }}>RM</div>
        <div style={{ fontSize: 13, color: colors.gray7, marginBottom: 4 }}>Rosa Mendoza receives</div>
        <div style={{ fontSize: 28, fontWeight: 700, color: colors.gray15, letterSpacing: '-0.5px' }}>MXN 5,241.00</div>
      </div>

      {/* Method rows */}
      <div style={{ background: '#fff' }}>
        {[
          { icon: payOutIcon, topLabel: 'Rosa receives with', bottomLabel: PAY_OUT_LABELS[payOut] },
          { icon: payInIcon,  topLabel: "You're paying with",  bottomLabel: PAY_IN_LABELS[payIn] },
        ].map((row, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '13px 20px', borderBottom: `1px solid ${colors.gray3}`, gap: 14 }}>
            <div style={{
              width: 40, height: 40, background: row.icon.bg, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
            }}>{row.icon.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: colors.gray7 }}>{row.topLabel}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.gray15 }}>{row.bottomLabel}</div>
            </div>
            <span style={{ fontSize: 20, color: colors.gray4, lineHeight: 1 }}>›</span>
          </div>
        ))}
      </div>

      {/* Estimate block */}
      <div style={{ margin: '12px 20px', background: '#eef4fb', border: `1px solid #d2e6f7`, borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ fontSize: 22, flexShrink: 0 }}>🛡️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.blue15 }}>{est.headline}</div>
            <div style={{ fontSize: 13, color: colors.blue12, marginTop: 2 }}>Money available by {est.fullDate}</div>
            <div style={{ fontSize: 12, color: colors.blue10, marginTop: 2 }}>{est.countdown}</div>
          </div>
        </div>
      </div>

      {/* Summary table */}
      <div style={{ margin: '0 20px', background: colors.gray1, border: `1px solid ${colors.gray3}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${colors.gray3}` }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: colors.gray13 }}>Summary</span>
          <button onClick={onBack} style={{ fontSize: 13, color: '#226ba4', textDecoration: 'underline' }}>Edit amount</button>
        </div>
        {summaryRows.map((row, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', padding: '10px 16px',
            borderTop: `1px solid ${colors.gray2}`,
            background: row.bold ? '#fff' : 'transparent',
          }}>
            <span style={{ fontSize: 14, color: row.bold ? colors.gray15 : colors.gray8, fontWeight: row.bold ? 700 : 400 }}>{row.label}</span>
            <span style={{ fontSize: 14, color: row.valueColor || (row.bold ? colors.gray15 : colors.gray9), fontWeight: row.bold ? 700 : 400 }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1, minHeight: 16 }} />

      {/* Footer + CTA */}
      <div style={{ padding: '0 20px 28px' }}>
        <div style={{ fontSize: 11, color: colors.gray7, lineHeight: 1.5, marginBottom: 14, textAlign: 'center' }}>
          By selecting <strong>Send</strong>, you're agreeing to our{' '}
          <span style={{ color: '#226ba4', textDecoration: 'underline' }}>User Agreement</span> and{' '}
          <span style={{ color: '#226ba4', textDecoration: 'underline' }}>Privacy Policy</span>.
        </div>
        <button
          onClick={handleSend}
          disabled={submitted}
          style={{
            width: '100%', background: submitted ? colors.gray9 : '#263647', color: '#fff',
            border: 'none', borderRadius: 28, padding: '17px', fontSize: 17, fontWeight: 700,
            letterSpacing: '0.1px', cursor: submitted ? 'default' : 'pointer', transition: 'opacity 0.12s',
          }}
          onMouseEnter={e => { if (!submitted) e.currentTarget.style.opacity = '0.88'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
        >
          {submitted ? '✓ Processing...' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CurrentCXSendFlow({ onSubmit, screen, onScreenChange }: CurrentCXSendFlowProps) {
  const [payOut, setPayOut] = useState<PayOutMethod>('bank-deposit');
  const [payIn, setPayIn] = useState<PayInMethod>('ach');
  const [payOutOpen, setPayOutOpen] = useState(false);
  const [payInOpen, setPayInOpen] = useState(false);

  const currentPayOutOption = PAY_OUT_OPTIONS.find(o => o.value === payOut)!;
  const currentPayInOption = PAY_IN_OPTIONS.find(o => o.value === payIn)!;
  const estimateText = ESTIMATE_TEXT[payOut][payIn];
  const feeRows = FEE_ROWS[payIn];

  if (screen === 'summary') {
    return (
      <SendSummary
        payIn={payIn}
        payOut={payOut}
        onSubmit={() => onSubmit(payIn === 'push-funds' ? 'push-funds' : 'happy')}
        onBack={() => onScreenChange('calculator')}
      />
    );
  }

  return (
    <div style={{
      background: '#f5f6f8',
      flex: 1,
      padding: '16px 16px 32px',
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
    }}>

      {/* ── Amount card ─────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: `1px solid ${colors.gray3}`, borderRadius: 14, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ padding: '14px 16px 12px' }}>
          <div style={{ fontSize: 13, color: colors.gray8, marginBottom: 4 }}>You send</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: colors.gray15, letterSpacing: '-1px' }}>300.00</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🇺🇸</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: colors.gray12 }}>USD</span>
            </div>
          </div>
        </div>
        <div style={{ height: 1, background: colors.gray3 }} />
        <div style={{ padding: '12px 16px 14px' }}>
          <div style={{ fontSize: 13, color: colors.gray8, marginBottom: 4 }}>They receive</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: colors.gray15, letterSpacing: '-1px' }}>5,241.00</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 22 }}>🇲🇽</span>
              <span style={{ fontSize: 16, fontWeight: 600, color: colors.gray12 }}>MXN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange rate */}
      <div style={{ textAlign: 'right', marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: colors.gray8 }}>1 USD = </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#226ba4', textDecoration: 'underline' }}>17.47 MXN</span>
      </div>

      {/* Promo banner */}
      <div style={{ background: '#e8f4fd', border: `1px solid #c5e4f7`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>✦</span>
          <span style={{ fontSize: 14, color: colors.blue15 }}><strong>Promo exchange rate</strong> applied</span>
        </div>
        <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${colors.blue10}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: colors.blue10, fontWeight: 700 }}>i</div>
      </div>

      {/* Delivery method dropdown */}
      <DropdownRow
        label="Delivery method"
        value={currentPayOutOption.label}
        sublabel={currentPayOutOption.sublabel}
        options={PAY_OUT_OPTIONS.map(o => ({ value: o.value, label: o.label, sublabel: o.sublabel }))}
        onSelect={v => setPayOut(v as PayOutMethod)}
        open={payOutOpen}
        onToggle={() => { setPayOutOpen(o => !o); setPayInOpen(false); }}
      />

      {/* Payment method dropdown */}
      <DropdownRow
        label="Payment method"
        value={currentPayInOption.label}
        options={PAY_IN_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
        onSelect={v => setPayIn(v as PayInMethod)}
        open={payInOpen}
        onToggle={() => { setPayInOpen(o => !o); setPayOutOpen(false); }}
      />

      {/* ── Estimate + fee card ──────────────────────────────────────────── */}
      <div style={{ background: '#eef4fb', border: `1px solid #d2e6f7`, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '13px 16px', borderBottom: `1px solid #d2e6f7` }}>
          <span style={{ fontSize: 15, color: colors.blue15, fontWeight: 500 }}>{estimateText}</span>
        </div>
        <div style={{ background: '#f5f8fc' }}>
          {feeRows.map((row, i) => {
            const isTotal = row.label === 'Total';
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: i > 0 ? `1px solid ${colors.gray3}` : 'none' }}>
                <span style={{ fontSize: 14, color: row.color || (isTotal ? colors.gray15 : colors.gray9), fontWeight: isTotal ? 700 : 400 }}>{row.label}</span>
                <span style={{ fontSize: 14, color: row.color || (isTotal ? '#226ba4' : colors.gray9), fontWeight: isTotal ? 700 : 400, textDecoration: isTotal ? 'underline' : 'none' }}>{row.amount}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Continue button ──────────────────────────────────────────────── */}
      <button
        onClick={() => onScreenChange('summary')}
        style={{
          width: '100%', background: '#263647', color: '#fff', border: 'none',
          borderRadius: 28, padding: '17px', fontSize: 17, fontWeight: 700,
          letterSpacing: '0.1px', cursor: 'pointer', transition: 'opacity 0.12s', marginBottom: 16,
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
      >
        Continue
      </button>

      {/* Disclaimer */}
      <div style={{ fontSize: 12, color: colors.gray8, lineHeight: 1.5 }}>
        Delivery speed is an <strong>estimate</strong>.
      </div>
    </div>
  );
}
