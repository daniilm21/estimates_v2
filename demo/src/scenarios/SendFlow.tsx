import { useState } from 'react';
import { type ViewMode, type PayInMethod, type PayOutMethod, type Scenario } from '../types';
import { colors } from '../tokens';

type SendFlowScreen = 'calculator' | 'summary';

interface SendFlowProps {
  viewMode: ViewMode;
  onSubmit: (scenario: Scenario) => void;
  screen: SendFlowScreen;
  onScreenChange: (s: SendFlowScreen) => void;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

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

const PAY_OUT_BY_TIME: Record<PayOutMethod, Record<PayInMethod, string>> = {
  'bank-deposit':  { 'debit-card': '6:30 PM', 'ach': '', 'push-funds': '' },
  'mobile-wallet': { 'debit-card': '3:30 PM', 'ach': '', 'push-funds': '' },
  'cash-pickup':   { 'debit-card': '3:00 PM', 'ach': '', 'push-funds': '' },
  'push-to-card':  { 'debit-card': '2:40 PM', 'ach': '', 'push-funds': '' },
};

const COUNTDOWN: Record<PayOutMethod, Record<PayInMethod, string>> = {
  'bank-deposit':  { 'debit-card': '~4 hours from now',     'ach': '~2 business days', 'push-funds': '4h after wire' },
  'mobile-wallet': { 'debit-card': '~1 hour from now',      'ach': '~2 business days', 'push-funds': '1h after wire' },
  'cash-pickup':   { 'debit-card': '~30 minutes from now',  'ach': '~2 business days', 'push-funds': '30 min after wire' },
  'push-to-card':  { 'debit-card': '~10 minutes from now',  'ach': '~1 business day',  'push-funds': '10 min after wire' },
};

const FULL_DATETIME: Record<PayOutMethod, Record<PayInMethod, string>> = {
  'bank-deposit': {
    'debit-card': 'Wednesday, 3 April 2026 at 6:30 PM',
    'ach':        'Friday, 5 April 2026',
    'push-funds': 'after your wire is received',
  },
  'mobile-wallet': {
    'debit-card': 'Wednesday, 3 April 2026 at 3:30 PM',
    'ach':        'Friday, 5 April 2026',
    'push-funds': 'after your wire is received',
  },
  'cash-pickup': {
    'debit-card': 'Wednesday, 3 April 2026 at 3:00 PM',
    'ach':        'Friday, 5 April 2026',
    'push-funds': 'after your wire is received',
  },
  'push-to-card': {
    'debit-card': 'Wednesday, 3 April 2026 at 2:40 PM',
    'ach':        'Thursday, 4 April 2026',
    'push-funds': 'after your wire is received',
  },
};

const FEE_INFO: Record<PayInMethod, { feeLabel: string; feeAmount: string; total: string; feeColor?: string }> = {
  'debit-card': { feeLabel: 'Transfer fee', feeAmount: '$3.99 USD', total: '$303.99 USD' },
  'ach':        { feeLabel: 'Transfer fee', feeAmount: '$1.99 USD', total: '$301.99 USD' },
  'push-funds': { feeLabel: 'Transfer fee', feeAmount: 'No fee',    total: '$300.00 USD', feeColor: colors.green11 },
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

// ─── Send Summary (New CX) ────────────────────────────────────────────────────

type GuaranteeTab = 'regular' | 'smb';

function SendSummary({
  payIn, payOut, viewMode, onSubmit, onBack,
}: { payIn: PayInMethod; payOut: PayOutMethod; viewMode: ViewMode; onSubmit: () => void; onBack: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [guaranteeTab, setGuaranteeTab] = useState<GuaranteeTab>('regular');
  const isDevView = viewMode === 'dev';

  const byTime = PAY_OUT_BY_TIME[payOut][payIn];
  const countdown = COUNTDOWN[payOut][payIn];
  const fullDatetime = FULL_DATETIME[payOut][payIn];
  const estimateText = ESTIMATE_TEXT[payOut][payIn];
  const hasConcreteTime = !!byTime;
  const fee = FEE_INFO[payIn];
  const payOutIcon = PAY_OUT_ICON[payOut];
  const payInIcon = PAY_IN_ICON[payIn];

  const handleSend = () => {
    setSubmitted(true);
    setTimeout(onSubmit, 600);
  };

  const summaryRows: { label: string; value: string; bold?: boolean; valueColor?: string }[] = [
    { label: 'Amount to send', value: '$300.00 USD' },
    { label: fee.feeLabel, value: fee.feeAmount, valueColor: fee.feeColor },
    { label: 'Total cost', value: fee.total, bold: true },
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
            <div style={{ width: 40, height: 40, background: row.icon.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{row.icon.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: colors.gray7 }}>{row.topLabel}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.gray15 }}>{row.bottomLabel}</div>
            </div>
            <span style={{ fontSize: 20, color: colors.gray4, lineHeight: 1 }}>›</span>
          </div>
        ))}
      </div>

      {/* ── New CX Estimate block — guarantee tabs ──────────────────────── */}
      <div style={{ margin: '12px 20px', background: '#eef4fb', border: `1px solid #d2e6f7`, borderRadius: 14, overflow: 'hidden' }}>

        {/* Tab strip */}
        <div style={{ display: 'flex', borderBottom: `1px solid #d2e6f7` }}>
          {([
            { id: 'regular' as GuaranteeTab, label: 'Regular' },
            { id: 'smb' as GuaranteeTab, label: 'SMB' },
          ]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setGuaranteeTab(tab.id)}
              style={{
                flex: 1, padding: '10px 0', fontSize: 13,
                fontWeight: guaranteeTab === tab.id ? 700 : 400,
                color: guaranteeTab === tab.id ? '#226ba4' : colors.gray8,
                background: guaranteeTab === tab.id ? '#fff' : 'transparent',
                borderBottom: guaranteeTab === tab.id ? '2px solid #226ba4' : '2px solid transparent',
              }}
            >{tab.label}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: '14px 16px' }}>
          {/* Delivery info — same structure for both tabs */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>🛡️</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: colors.blue15 }}>{estimateText}</div>
              <div style={{ fontSize: 13, color: colors.blue12, marginTop: 2 }}>Money available by {fullDatetime}</div>
              <div style={{ fontSize: 12, color: colors.blue10, marginTop: 2 }}>{countdown}</div>
            </div>
          </div>

          {/* Guarantee emphasis — differs by tab */}
          <div style={{ borderTop: `1px solid #d2e6f7`, paddingTop: 10 }}>
            {guaranteeTab === 'regular' ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.green11, marginBottom: 4 }}>
                  ✓ {hasConcreteTime ? `Delivered by ${byTime} — or your fee back, automatically` : 'Delivered on time — or your fee back, automatically'}
                </div>
                <div style={{ fontSize: 13, color: colors.blue12, lineHeight: 1.5 }}>
                  If we miss the promised delivery time, your {fee.feeAmount === 'No fee' ? 'fee' : fee.feeAmount} is refunded automatically. No request needed.
                </div>
                {isDevView && (
                  <div style={{ marginTop: 8, fontSize: 11, color: colors.blue10, fontFamily: 'monospace', background: 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '4px 8px' }}>
                    concession: yellow=$2 credit / red=full fee refund / severe=fee+$5
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.green11, marginBottom: 4 }}>
                  ✓ On-time delivery, guaranteed
                </div>
                <div style={{ fontSize: 13, color: colors.blue12, lineHeight: 1.5 }}>
                  Every transfer is monitored in real time. If a payment is delayed past the committed time, a <strong>$200 credit</strong> is automatically applied to your account. No claims or follow-up required.
                </div>
                {isDevView && (
                  <div style={{ marginTop: 8, fontSize: 11, color: colors.blue10, fontFamily: 'monospace', background: 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '4px 8px' }}>
                    SMB concession: yellow=2% / red=fee+5% / severe=fee+10%+CS escalation
                  </div>
                )}
              </>
            )}
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
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderTop: `1px solid ${colors.gray2}`, background: row.bold ? '#fff' : 'transparent' }}>
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

// ─── Main component (calculator) ─────────────────────────────────────────────

export function SendFlow({ viewMode, onSubmit, screen, onScreenChange }: SendFlowProps) {
  const isDevView = viewMode === 'dev';
  const [payOut, setPayOut] = useState<PayOutMethod>('bank-deposit');
  const [payIn, setPayIn] = useState<PayInMethod>('ach');
  const [payOutOpen, setPayOutOpen] = useState(false);
  const [payInOpen, setPayInOpen] = useState(false);
  const [docState, setDocState] = useState<'visible' | 'uploaded' | 'dismissed' | 'hidden'>('hidden');

  const currentPayOutOption = PAY_OUT_OPTIONS.find(o => o.value === payOut)!;
  const currentPayInOption = PAY_IN_OPTIONS.find(o => o.value === payIn)!;
  const estimateText = ESTIMATE_TEXT[payOut][payIn];
  const byTime = PAY_OUT_BY_TIME[payOut][payIn];

  if (screen === 'summary') {
    return (
      <SendSummary
        payIn={payIn}
        payOut={payOut}
        viewMode={viewMode}
        onSubmit={() => onSubmit(payIn === 'push-funds' ? 'push-funds' : 'happy')}
        onBack={() => onScreenChange('calculator')}
      />
    );
  }

  const handlePayOutSelect = (v: string) => {
    setPayOut(v as PayOutMethod);
    if (docState === 'hidden') setDocState('visible');
  };

  return (
    <div style={{ padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Amount card ──────────────────────────────────────────────────── */}
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
        onSelect={handlePayOutSelect}
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

      {/* Doc nudge banner */}
      {docState === 'visible' && (
        <div className="slide-in" style={{ background: colors.yellow2, border: `1px solid ${colors.yellow6}`, borderRadius: 12, padding: '12px 14px', marginBottom: 16, fontSize: 13, color: '#603700', lineHeight: 1.5 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>💡 Heads up — save time on this transfer</div>
          <div style={{ marginBottom: 10 }}>Last time you sent to Rosa, we paused the transfer to verify a document — it added about 4 hours to her wait. Upload a fresh copy now.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setDocState('uploaded')} style={{ background: '#f9ad47', color: '#fff', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700 }}>Upload docs</button>
            <button onClick={() => setDocState('dismissed')} style={{ background: 'transparent', color: '#7a4908', borderRadius: 8, padding: '8px 14px', fontSize: 13, border: `1px solid #ffc472` }}>Skip for now</button>
          </div>
        </div>
      )}
      {docState === 'uploaded' && (
        <div className="slide-in" style={{ background: colors.green2, border: `1px solid ${colors.green8}`, borderRadius: 12, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: colors.green12 }}>
          ✅ <strong>Documents received</strong> — your transfer is clear to go!
          {isDevView && <div style={{ marginTop: 4, fontSize: 11, color: colors.green10 }}>⚙️ Risk segment: pre-cleared — removed from estimate</div>}
        </div>
      )}
      {docState === 'dismissed' && (
        <div style={{ marginBottom: 12, fontSize: 12, color: colors.gray8, fontStyle: 'italic' }}>Tip: having your docs ready speeds things up if we need to verify mid-transfer.</div>
      )}

      {/* ── Estimate card (segment bar only, no fee rows) ────────────────── */}
      <div style={{ background: '#eef4fb', border: `1px solid #d2e6f7`, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '13px 16px', borderBottom: `1px solid #d2e6f7`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, color: colors.blue15, fontWeight: 500 }}>{estimateText}</span>
          {byTime && payIn !== 'push-funds' && (
            <span style={{ fontSize: 17, fontWeight: 700, color: colors.green11 }}>{byTime}</span>
          )}
        </div>
        <div style={{ background: '#f5f8fc' }}>
          {[
            { label: isDevView ? 'Flat fee' : 'Transfer fee', amount: FEE_INFO[payIn].feeAmount, color: FEE_INFO[payIn].feeColor },
            { label: 'Total', amount: FEE_INFO[payIn].total, isTotal: true },
          ].map((row, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: i > 0 ? `1px solid ${colors.gray3}` : 'none' }}>
              <span style={{ fontSize: 14, color: row.color || (row.isTotal ? colors.gray15 : colors.gray9), fontWeight: row.isTotal ? 700 : 400 }}>{row.label}</span>
              <span style={{ fontSize: 14, color: row.color || (row.isTotal ? '#226ba4' : colors.gray9), fontWeight: row.isTotal ? 700 : 400, textDecoration: row.isTotal ? 'underline' : 'none' }}>{row.amount}</span>
            </div>
          ))}
          {isDevView && (
            <div style={{ fontSize: 11, color: colors.gray8, fontFamily: 'monospace', background: colors.gray2, borderRadius: 6, padding: '4px 8px', margin: '0 16px 10px' }}>
              draft_estimate = Pay-In ({payIn === 'ach' ? '1–2 days' : payIn === 'push-funds' ? 'pending' : '0min'}) + Pay-Out ({payOut === 'push-to-card' ? '10min' : payOut === 'cash-pickup' ? '30min' : payOut === 'mobile-wallet' ? '1h' : '4h'}) + buffers (2min)
            </div>
          )}
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

      <div style={{ fontSize: 12, color: colors.gray8, lineHeight: 1.5 }}>
        Delivery speed is an <strong>estimate</strong>.
      </div>
    </div>
  );
}
