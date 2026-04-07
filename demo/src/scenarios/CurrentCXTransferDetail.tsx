/**
 * CurrentCXTransferDetail — replicates the live Remitly Transfer Detail / post-submit screens.
 * Visual reference: screenshots provided 2026-04-03.
 *
 * Layout:
 *   - Light gray background (#f5f6f8)
 *   - Recipient name + amount header
 *   - Reference number
 *   - Status label (colored)
 *   - Body copy / CTA (varies by state)
 *   - Vertical progress timeline
 *   - "Transfer Details" collapsible footer
 */

import { useState } from 'react';
import type { ReactElement } from 'react';
import { type Scenario } from '../types';
import { colors } from '../tokens';

// ─── Timeline ─────────────────────────────────────────────────────────────────

type NodeState = 'active-error' | 'active-remitly' | 'pending' | 'completed';

interface TimelineNode {
  label: string;
  sublabel?: string;
  state: NodeState;
}

function TimelineNodeDot({ state }: { state: NodeState }) {
  const filled = state === 'active-error' || state === 'active-remitly' || state === 'completed';
  const color = state === 'active-error' ? '#c0392b'
    : state === 'active-remitly' ? '#226ba4'
    : state === 'completed' ? colors.green11
    : 'transparent';
  const borderColor = state === 'pending' ? colors.gray5 : color;

  return (
    <div style={{
      width: 16,
      height: 16,
      borderRadius: '50%',
      border: `2px solid ${borderColor}`,
      background: filled ? color : 'transparent',
      flexShrink: 0,
      position: 'relative',
      zIndex: 1,
    }}>
      {state === 'completed' && (
        <svg width="8" height="8" viewBox="0 0 10 10" style={{ position: 'absolute', top: 2, left: 2 }} fill="none">
          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </div>
  );
}

function Timeline({ nodes }: { nodes: TimelineNode[] }) {
  return (
    <div style={{ padding: '4px 0', marginTop: 8 }}>
      {nodes.map((node, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', position: 'relative' }}>
          {/* Dot + connector line */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 16, flexShrink: 0 }}>
            <TimelineNodeDot state={node.state} />
            {i < nodes.length - 1 && (
              <div style={{
                width: 2,
                flex: 1,
                minHeight: 28,
                background: i === 0 && node.state === 'active-error'
                  ? `linear-gradient(${colors.gray4}, ${colors.gray4})`
                  : colors.gray4,
                borderRadius: 1,
                margin: '3px 0',
              }} />
            )}
          </div>

          {/* Label */}
          <div style={{ paddingBottom: i < nodes.length - 1 ? 24 : 0, paddingTop: 0 }}>
            <div style={{
              fontSize: 15,
              fontWeight: node.state !== 'pending' ? 600 : 400,
              color: node.state === 'pending' ? colors.gray7 : colors.gray15,
              lineHeight: 1.2,
            }}>
              {node.label}
            </div>
            {node.sublabel && (
              <div style={{ fontSize: 13, color: colors.gray7, marginTop: 3, lineHeight: 1.4 }}>
                {node.sublabel}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Transfer Details accordion ───────────────────────────────────────────────

function TransferDetailsAccordion() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderTop: `1px solid ${colors.gray3}`, marginTop: 16 }}>
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
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <path d="M6 9l6 6 6-6" stroke={colors.gray9} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="slide-in" style={{ paddingBottom: 16 }}>
          {[
            ['Transfer ID', '#RM-2847561'],
            ['Initiated', 'Today at 2:30 PM'],
            ['You sent', '$300.00 USD'],
            ['Rosa receives', 'MXN 5,241.00'],
            ['Exchange rate', '1 USD = 17.47 MXN'],
            ['Fee', '$3.99 USD'],
            ['Delivery method', 'Bank Deposit · BBVA Mexico'],
            ['Payment method', 'Debit Card'],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderTop: `1px solid ${colors.gray2}` }}>
              <span style={{ fontSize: 13, color: colors.gray8 }}>{label}</span>
              <span style={{ fontSize: 13, color: colors.gray13, fontWeight: 500 }}>{val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Shared header ────────────────────────────────────────────────────────────

function TransferHeader({ status, statusColor }: { status: string; statusColor: string }) {
  return (
    <div style={{ background: '#fff', padding: '16px 20px', borderBottom: `1px solid ${colors.gray3}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 700, color: colors.gray15 }}>Rosa Mendoza</span>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: colors.gray15 }}>300.00 USD</div>
          <div style={{ fontSize: 13, color: colors.gray7 }}>5,241.00 MXN</div>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: colors.gray7 }}>Reference number</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: colors.gray15 }}>RM-2847561</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 16, color: statusColor }}>ⓘ</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: statusColor }}>{status}</span>
      </div>
    </div>
  );
}

// ─── Pill CTA button (matches screenshot) ─────────────────────────────────────

function PillButton({ label, icon, onClick }: { label: string; icon?: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: '#263647',
        color: '#fff',
        border: 'none',
        borderRadius: 28,
        padding: '17px',
        fontSize: 17,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: 'pointer',
        margin: '8px 0',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

// ─── Scenario-specific views ──────────────────────────────────────────────────

function HappyState() {
  const nodes: TimelineNode[] = [
    { label: 'Your debit card', sublabel: 'Payment complete', state: 'completed' },
    { label: 'Remitly', sublabel: 'Processing your transfer', state: 'active-remitly' },
    { label: "Recipient's bank", state: 'pending' },
    { label: "Recipient's account", state: 'pending' },
  ];
  return (
    <div style={{ flex: 1 }}>
      <TransferHeader status="In progress" statusColor="#226ba4" />
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 15, color: colors.gray12, lineHeight: 1.6, marginBottom: 16 }}>
          Your transfer is being processed. Estimated delivery: <strong>by 6:30 PM today</strong>.
        </p>
        <Timeline nodes={nodes} />
        <TransferDetailsAccordion />
      </div>
    </div>
  );
}

function DelayState() {
  const nodes: TimelineNode[] = [
    { label: 'Your debit card', sublabel: 'Payment complete', state: 'completed' },
    { label: 'Remitly', sublabel: 'Processing your transfer', state: 'active-remitly' },
    { label: "Recipient's bank", sublabel: 'Delayed', state: 'pending' },
    { label: "Recipient's account", state: 'pending' },
  ];
  return (
    <div style={{ flex: 1 }}>
      <TransferHeader status="Delayed" statusColor={colors.yellow13} />
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 15, color: colors.gray12, lineHeight: 1.6, marginBottom: 16 }}>
          Your transfer is taking a little longer than expected. We'll update you as soon as it's delivered.
        </p>
        <Timeline nodes={nodes} />
        <TransferDetailsAccordion />
      </div>
    </div>
  );
}

function PushFundsState() {
  const nodes: TimelineNode[] = [
    { label: 'Your wire transfer', sublabel: 'Waiting for your payment', state: 'active-error' },
    { label: 'Remitly', state: 'pending' },
    { label: "Recipient's bank", state: 'pending' },
    { label: "Recipient's account", state: 'pending' },
  ];
  return (
    <div style={{ flex: 1 }}>
      <TransferHeader status="Waiting for payment" statusColor={colors.yellow13} />
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 15, color: colors.gray12, lineHeight: 1.6, marginBottom: 4 }}>
          Please wire <strong>$300.00</strong> to our account to start your transfer.
        </p>
        <p style={{ fontSize: 13, color: colors.gray8, lineHeight: 1.5, marginBottom: 16 }}>
          Transfers not funded within 72 hours will be canceled and refunded.
        </p>
        <PillButton label="View wire instructions" icon="🏦" />
        <Timeline nodes={nodes} />
        <TransferDetailsAccordion />
      </div>
    </div>
  );
}

function RiskReviewState() {
  const nodes: TimelineNode[] = [
    { label: 'Your debit card', sublabel: 'For your security, we need a little more information', state: 'active-error' },
    { label: 'Remitly', state: 'pending' },
    { label: "Recipient's bank", state: 'pending' },
    { label: "Recipient's account", state: 'pending' },
  ];
  return (
    <div style={{ flex: 1 }}>
      <TransferHeader status="On hold" statusColor="#c0392b" />
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 15, color: colors.gray12, lineHeight: 1.6, marginBottom: 4 }}>
          <span style={{ color: '#226ba4', fontWeight: 600 }}>Contact us</span> or click 'Edit transfer'. We have identified a problem with your transfer.
        </p>
        <p style={{ fontSize: 14, color: colors.gray9, lineHeight: 1.5, marginBottom: 16 }}>
          Transfers that are not edited within 72 hours will be canceled and refunded.
        </p>
        <PillButton label="Edit transfer" icon="✏" />
        <Timeline nodes={nodes} />
        <TransferDetailsAccordion />
      </div>
    </div>
  );
}

function AmendmentState() {
  const nodes: TimelineNode[] = [
    { label: 'Your debit card', sublabel: 'Payment complete', state: 'completed' },
    { label: 'Remitly', sublabel: 'Processing complete', state: 'completed' },
    { label: "Recipient's bank", sublabel: 'Account number rejected', state: 'active-error' },
    { label: "Recipient's account", state: 'pending' },
  ];
  return (
    <div style={{ flex: 1 }}>
      <TransferHeader status="On hold" statusColor="#c0392b" />
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 15, color: colors.gray12, lineHeight: 1.6, marginBottom: 4 }}>
          <span style={{ color: '#226ba4', fontWeight: 600 }}>Contact us</span> or click 'Edit transfer'. The recipient's bank account number was rejected.
        </p>
        <p style={{ fontSize: 14, color: colors.gray9, lineHeight: 1.5, marginBottom: 16 }}>
          Transfers that are not edited within 72 hours will be canceled and refunded.
        </p>
        <PillButton label="Edit transfer" icon="✏" />
        <Timeline nodes={nodes} />
        <TransferDetailsAccordion />
      </div>
    </div>
  );
}

function SMBState() {
  const nodes: TimelineNode[] = [
    { label: 'Your debit card', sublabel: 'Payment complete', state: 'completed' },
    { label: 'Remitly', sublabel: 'Processing', state: 'active-remitly' },
    { label: "Recipient's bank", state: 'pending' },
    { label: "Recipient's account", state: 'pending' },
  ];
  return (
    <div style={{ flex: 1 }}>
      <div style={{ background: '#fff', padding: '16px 20px', borderBottom: `1px solid ${colors.gray3}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: colors.gray15 }}>John LLC</span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: colors.gray15 }}>4,300.00 USD</div>
            <div style={{ fontSize: 13, color: colors.gray7 }}>5 recipients</div>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 12, color: colors.gray7 }}>Reference number</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.gray15 }}>RM-5193847</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#226ba4' }}>ⓘ In progress</span>
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <p style={{ fontSize: 14, color: colors.gray9, marginBottom: 4 }}>
          2 of 5 recipients delivered. 1 transfer delayed. See activity for details.
        </p>
        <Timeline nodes={nodes} />
        <TransferDetailsAccordion />
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface CurrentCXTransferDetailProps {
  scenario: Scenario;
}

export function CurrentCXTransferDetail({ scenario }: CurrentCXTransferDetailProps) {
  const views: Record<Scenario, ReactElement> = {
    'send-flow': <HappyState />,
    'happy':      <HappyState />,
    'delay':      <DelayState />,
    'push-funds': <PushFundsState />,
    'risk-review':<RiskReviewState />,
    'amendment':  <AmendmentState />,
    'smb':        <SMBState />,
  };

  return (
    <div style={{ background: '#f5f6f8', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {views[scenario]}
    </div>
  );
}
