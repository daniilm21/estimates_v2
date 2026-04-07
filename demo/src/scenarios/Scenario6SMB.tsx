import { useState } from 'react';
import { type ViewMode } from '../types';
import { Card, Banner } from '../components/Card';
import { TransferShell } from '../components/TransferShell';
import { colors } from '../tokens';

interface Props { viewMode: ViewMode }

interface Recipient {
  name: string;
  flag: string;
  country: string;
  amount: string;
  method: string;
  partner: string;
  status: 'delivered' | 'on-track' | 'late';
  eta: string;
  hasReview?: boolean;
  delay?: string;
  credit?: string;
}

const recipients: Recipient[] = [
  { name: 'Maria Garcia', flag: '🇲🇽', country: 'Mexico', amount: '$800', method: 'Bank Deposit', partner: 'BBVA Mexico', status: 'delivered', eta: 'Delivered 11:47 AM' },
  { name: 'Juan Reyes', flag: '🇵🇭', country: 'Philippines', amount: '$600', method: 'Mobile Wallet', partner: 'GCash', status: 'delivered', eta: 'Delivered 12:03 PM' },
  { name: 'Priya Patel', flag: '🇮🇳', country: 'India', amount: '$1,200', method: 'Bank Deposit', partner: 'HDFC Bank', status: 'on-track', eta: 'by 5:30 PM' },
  { name: 'Ana Oliveira', flag: '🇧🇷', country: 'Brazil', amount: '$750', method: 'Push to Card', partner: 'Nubank', status: 'on-track', eta: 'by 6:00 PM' },
  { name: 'Carlos Diaz', flag: '🇨🇴', country: 'Colombia', amount: '$950', method: 'Cash Pickup', partner: 'Efecty', status: 'late', eta: 'by 2:45 PM (+45 min late)', hasReview: true, delay: '45 min', credit: '$200' },
];

function statusColor(status: Recipient['status']): { bg: string; text: string; border: string; icon: string; label: string } {
  switch (status) {
    case 'delivered': return { bg: colors.green2, text: colors.green12, border: colors.green8, icon: '✅', label: 'Delivered' };
    case 'on-track':  return { bg: colors.blue1, text: colors.blue10, border: colors.blue5, icon: '🟢', label: 'On Track' };
    case 'late':      return { bg: colors.red2, text: colors.red9, border: colors.red7, icon: '🔴', label: 'Late' };
  }
}

export function Scenario6SMB({ viewMode }: Props) {
  const [expandedRecipient, setExpandedRecipient] = useState<string | null>(null);
  const isDevView = viewMode === 'dev';

  return (
    <TransferShell
      recipient="John LLC"
      amount="$4,300.00"
      localAmount="5 recipients"
      transferId="#RM-5193847"
      initiatedAt="Today, 10:00 AM"
      payIn={isDevView ? 'Pay-In: Debit Card' : 'Debit Card'}
      isDevView={isDevView}
      accordionRows={[
        ['Batch ID', '#RM-5193847'],
        ['Initiated', 'Today, 10:00 AM'],
        ['Total sent', '$4,300.00 USD'],
        ['Recipients', '5'],
        ['Payment method', 'Debit Card'],
        ['Delivered', '2 of 5'],
        ['In progress', '2 of 5'],
        ['Delayed', '1 of 5'],
      ]}
    >
      {/* Payment bar */}
      <Card>
        <div style={{ fontSize: 11, fontWeight: 600, color: colors.gray8, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          {isDevView ? 'Pay-In' : 'Payment'}
        </div>
        <div style={{
          padding: '8px 14px',
          background: colors.green2,
          border: `1.5px solid ${colors.green8}`,
          borderRadius: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 13,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: colors.green10 }}>✓</span>
            <span style={{ fontWeight: 600, color: colors.green12 }}>
              {isDevView ? 'Pay-In: Debit Card' : 'Payment: Debit Card'}
            </span>
          </div>
          <div style={{ fontSize: 12, color: colors.green10 }}>$4,300.00 · 10:00 AM</div>
        </div>
      </Card>

      {/* Recipient tracks */}
      <Card style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.gray8, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
          {isDevView ? 'Pay-Out tracks' : 'Disbursements'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recipients.map(r => {
            const sc = statusColor(r.status);
            const isExpanded = expandedRecipient === r.name;

            return (
              <div key={r.name}>
                <div
                  onClick={() => setExpandedRecipient(isExpanded ? null : r.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: sc.bg,
                    border: `1.5px solid ${sc.border}`,
                    borderRadius: 12,
                    cursor: 'pointer',
                    gap: 8,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ color: colors.gray5, fontSize: 14, flexShrink: 0 }}>
                    {r.name === 'Carlos Diaz' ? '└' : '├'}
                  </div>
                  {r.hasReview && (
                    <div style={{
                      padding: '2px 7px',
                      background: colors.green2,
                      border: `1px solid ${colors.green8}`,
                      borderRadius: 10,
                      fontSize: 10,
                      fontWeight: 600,
                      color: colors.green11,
                      flexShrink: 0,
                    }}>
                      {isDevView ? 'Risk ✓' : 'Review ✓'}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: sc.text }}>{r.name} {r.flag}</span>
                      <span style={{ fontSize: 12, color: colors.gray8 }}>{r.amount}</span>
                    </div>
                    <div style={{ fontSize: 11, color: colors.gray8 }}>{r.method} · {r.partner}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: sc.text }}>{sc.icon} {sc.label}</div>
                    <div style={{ fontSize: 11, color: r.status === 'late' ? colors.red9 : colors.gray8 }}>{r.eta}</div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="slide-in" style={{
                    margin: '4px 0 4px 24px',
                    padding: '10px 12px',
                    background: '#fff',
                    border: `1px solid ${sc.border}`,
                    borderRadius: 10,
                    fontSize: 13,
                    color: colors.gray9,
                  }}>
                    {r.status === 'late' && r.credit ? (
                      <>
                        <div style={{ color: colors.red9, fontWeight: 600, marginBottom: 4 }}>
                          ⚠ Delayed by {r.delay} — Efecty partner processing backlog
                        </div>
                        <div>
                          💙 Sorry, we're {r.delay} late on Carlos' payment — our fault. We'll apply a <strong>{r.credit} credit</strong> to your next transaction with us.
                        </div>
                        {isDevView && (
                          <div style={{ marginTop: 6, fontSize: 11, color: colors.gray8, fontFamily: 'monospace' }}>
                            original_estimate = 4h → 2:00 PM | current_estimate = 4h 45min → 2:45 PM (+18.75%)
                          </div>
                        )}
                      </>
                    ) : r.status === 'delivered' ? (
                      <div style={{ color: colors.green12 }}>✅ {r.name} received {r.amount} — {r.eta}</div>
                    ) : (
                      <div>
                        🟢 On track — {r.name} should receive {r.amount} {r.eta}.
                        {isDevView && (
                          <div style={{ marginTop: 4, fontSize: 11, color: colors.gray8, fontFamily: 'monospace' }}>
                            current_estimate = original_estimate · no delays detected
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Banner variant="error">
        <div style={{ fontWeight: 600, marginBottom: 4 }}>1 payment delayed — Carlos Diaz 🇨🇴</div>
        <div style={{ fontSize: 13 }}>
          Sorry, we're 45 minutes late on Carlos' payment — our fault. We'll apply a <strong>$200 credit</strong> to your next transaction with us. 💙
        </div>
      </Banner>

      {/* Summary stats */}
      <Card style={{ background: colors.gray1 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: colors.gray8, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
          Batch Summary
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Delivered', value: '2', color: colors.green11 },
            { label: 'In Progress', value: '2', color: colors.blue10 },
            { label: 'Delayed', value: '1', color: colors.red9 },
            { label: 'Total', value: '$4,300', color: colors.gray13 },
          ].map(stat => (
            <div key={stat.label} style={{ flex: 1, minWidth: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: colors.gray8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </Card>
    </TransferShell>
  );
}
