import { useState } from 'react';
import { type ViewMode } from '../types';
import { Card, Banner } from '../components/Card';
import { LifecycleBar, type Segment } from '../components/LifecycleBar';
import { TransferShell } from '../components/TransferShell';
import { colors } from '../tokens';

interface Props { viewMode: ViewMode }

export function Scenario3PushFunds({ viewMode }: Props) {
  const [showWireDetails, setShowWireDetails] = useState(false);
  const isDevView = viewMode === 'dev';

  const segments: Segment[] = [
    {
      id: 'pay-in',
      customerLabel: 'Payment',
      devLabel: 'Pay-In',
      state: 'active-customer',
      subLabel: 'Wire pending',
      onClick: () => setShowWireDetails(!showWireDetails),
      flexGrow: 1,
    },
    {
      id: 'pay-out',
      customerLabel: 'Disbursement',
      devLabel: 'Pay-Out',
      state: 'pending',
      subLabel: '4h after wire',
      flexGrow: 2,
    },
  ];

  return (
    <TransferShell
      recipient="Rosa Mendoza 🇲🇽"
      amount="$300.00"
      localAmount="MXN 5,241.00"
      transferId="#RM-2847561"
      initiatedAt="Today, 2:30 PM"
      payIn={isDevView ? 'Pay-In: Push Funds (wire)' : 'Push Funds · Wire Transfer'}
      payOut={isDevView ? 'Pay-Out: Bank Deposit' : 'Bank Deposit · BBVA Mexico'}
      isDevView={isDevView}
    >
      <Card>
        <LifecycleBar
          segments={segments}
          isDevView={isDevView}
          etaLine={
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.yellow13 }}>
                by 7:30 PM
              </div>
              <div style={{ fontSize: 13, color: colors.gray8 }}>pending your wire · 4h after receipt</div>
            </div>
          }
          devPanel={isDevView ? (
            <div style={{ fontSize: 12, color: colors.blue15, lineHeight: 1.6 }}>
              <div><span style={{ fontFamily: 'monospace' }}>original_estimate</span> = conditional — locked when wire received</div>
              <div>Pay-In state: <span style={{ fontFamily: 'monospace' }}>WAITING_FOR_WIRE</span> · customer-owned timing</div>
              <div>Wire by 3:30 PM → Pay-Out 4h → delivery 7:30 PM</div>
              <div>TUS: <span style={{ fontFamily: 'monospace' }}>PUSH_FUNDS_PENDING</span></div>
            </div>
          ) : undefined}
        />

        {/* Wire instructions */}
        <div style={{ marginTop: 12 }}>
          <div style={{
            padding: '12px 14px',
            background: colors.amberLight,
            border: `1px solid ${colors.amber}`,
            borderRadius: 10,
            fontSize: 13,
            color: colors.yellow13,
          }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              ⊙ Rosa's waiting — wire $300 to get started.
            </div>
            <div style={{ marginBottom: 10 }}>
              Wire in the next hour and Rosa receives her money by <strong>7:30 PM</strong>. The sooner you act, the sooner she gets it.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '7px 10px',
              }}>
                <div>
                  <div style={{ fontSize: 11, color: colors.yellow13, opacity: 0.7, marginBottom: 1 }}>Bank</div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Remitly's Partner Bank</div>
                </div>
                <button
                  onClick={() => navigator.clipboard?.writeText('Remitly\'s Partner Bank')}
                  style={{ background: colors.amber, color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}
                >Copy</button>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'rgba(255,255,255,0.6)', borderRadius: 8, padding: '7px 10px',
              }}>
                <div>
                  <div style={{ fontSize: 11, color: colors.yellow13, opacity: 0.7, marginBottom: 1 }}>Reference</div>
                  <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'monospace' }}>RM-2847561-CARLOS</div>
                </div>
                <button
                  onClick={() => navigator.clipboard?.writeText('RM-2847561-CARLOS')}
                  style={{ background: colors.amber, color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}
                >Copy</button>
              </div>
            </div>

            <button
              onClick={() => setShowWireDetails(!showWireDetails)}
              style={{
                background: 'transparent',
                color: colors.yellow13,
                borderRadius: 8,
                padding: '6px 0',
                fontSize: 12,
                fontWeight: 600,
                textDecoration: 'underline',
              }}
            >
              {showWireDetails ? 'Hide full details ↑' : 'See all wire details'}
            </button>
          </div>

          {showWireDetails && (
            <div className="slide-in" style={{
              marginTop: 8,
              padding: '12px 14px',
              background: '#fff',
              border: `1px solid ${colors.gray3}`,
              borderRadius: 10,
              fontSize: 13,
              color: colors.gray13,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Full wire transfer details</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontFamily: 'monospace', fontSize: 12 }}>
                <div><span style={{ color: colors.gray8, fontFamily: 'inherit' }}>Account:</span> 1234567890</div>
                <div><span style={{ color: colors.gray8, fontFamily: 'inherit' }}>Routing:</span> 021000021</div>
                <div><span style={{ color: colors.gray8, fontFamily: 'inherit' }}>Amount:</span> $300.00 USD exactly</div>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: colors.gray8, fontStyle: 'italic' }}>
                Include the reference number so we can match your wire to this transfer.
              </div>
            </div>
          )}
        </div>
      </Card>

      <Banner variant="customer">
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Your action needed</div>
        <div style={{ fontSize: 13 }}>
          Rosa's counting on you — wire $300 to our account to get started. Estimated delivery: <strong>4h after your wire is received</strong>.
        </div>
      </Banner>
    </TransferShell>
  );
}
