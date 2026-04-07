import { useState } from 'react';
import { type ViewMode } from '../types';
import { Card, Banner } from '../components/Card';
import { LifecycleBar, type Segment } from '../components/LifecycleBar';
import { TransferShell, SubStateNav } from '../components/TransferShell';
import { colors } from '../tokens';

interface Props { viewMode: ViewMode }

type SubState = 'in-progress' | 'delivered';

export function Scenario1Happy({ viewMode }: Props) {
  const [subState, setSubState] = useState<SubState>('in-progress');
  const [expandedSeg, setExpandedSeg] = useState<string | null>(null);
  const isDevView = viewMode === 'dev';

  const segments: Segment[] = subState === 'in-progress'
    ? [
        {
          id: 'pay-in',
          customerLabel: 'Payment ✓',
          devLabel: 'Pay-In ✓',
          state: 'completed',
          subLabel: 'Debit Card',
          tooltip: 'Payment complete — Debit Card charged instantly.',
          onClick: () => setExpandedSeg(expandedSeg === 'pay-in' ? null : 'pay-in'),
        },
        {
          id: 'pay-out',
          customerLabel: 'Disbursement',
          devLabel: 'Pay-Out',
          state: 'active-remitly',
          subLabel: 'BBVA Mexico',
          tooltip: 'On track! Rosa\'s money arrives by 6:30 PM.',
          onClick: () => setExpandedSeg(expandedSeg === 'pay-out' ? null : 'pay-out'),
          flexGrow: 2,
        },
      ]
    : [
        {
          id: 'pay-in',
          customerLabel: 'Payment ✓',
          devLabel: 'Pay-In ✓',
          state: 'completed',
          subLabel: 'Debit Card',
        },
        {
          id: 'pay-out',
          customerLabel: 'Delivered 🎉',
          devLabel: 'Pay-Out 🎉',
          state: 'delivered',
          subLabel: '5:47 PM',
          flexGrow: 2,
        },
      ];

  const subStateNav = (
    <SubStateNav
      tabs={[
        { id: 'in-progress' as SubState, label: 'In Progress' },
        { id: 'delivered' as SubState, label: 'Delivered 🎉' },
      ]}
      active={subState}
      onChange={(s) => { setSubState(s); setExpandedSeg(null); }}
    />
  );

  return (
    <TransferShell
      recipient="Rosa Mendoza 🇲🇽"
      amount="$300.00"
      localAmount="MXN 5,241.00"
      transferId="#RM-2847561"
      initiatedAt="Today, 2:30 PM"
      payIn={isDevView ? 'Pay-In: Debit Card' : 'Debit Card'}
      payOut={isDevView ? 'Pay-Out: Bank Deposit' : 'Bank Deposit · BBVA Mexico'}
      isDevView={isDevView}
      subStateNav={subStateNav}
    >
      <Card>
        <LifecycleBar
          segments={segments}
          isDevView={isDevView}
          originalEta="6:30 PM"
          currentEta={subState === 'delivered' ? undefined : 'by 6:30 PM'}
          trackRecord={subState === 'in-progress' ? 'On time for your last 7 transfers to Rosa' : undefined}
          etaLine={
            subState === 'delivered' ? (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: colors.green11 }}>
                  🎉 Delivered at 5:47 PM
                </div>
                <div style={{ fontSize: 13, color: colors.gray8 }}>
                  Promised by 6:30 PM · Arrived 43 min early
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: colors.green11 }}>
                  by 6:30 PM
                </div>
                <div style={{ fontSize: 13, color: colors.gray8 }}>in 4h · on track</div>
              </div>
            )
          }
          devPanel={isDevView ? (
            <div style={{ fontSize: 12, color: colors.blue15, lineHeight: 1.6 }}>
              <div><span style={{ fontFamily: 'monospace' }}>original_estimate</span> = 4h → 6:30 PM (locked at submit)</div>
              <div><span style={{ fontFamily: 'monospace' }}>current_estimate</span> = 4h → 6:30 PM ✓ no recalculation needed</div>
              <div>Pay-In: Debit Card — instant · Pay-Out: BBVA Mexico · Route: MX_BBVA_BANK</div>
              {subState === 'delivered' && (
                <div style={{ marginTop: 4, color: colors.green11 }}>
                  ✓ PDP Hit — delivered 43 min ahead of promise · disbursement_end: 5:47 PM
                </div>
              )}
            </div>
          ) : undefined}
        />

        {/* Expanded segment details */}
        {expandedSeg === 'pay-in' && subState === 'in-progress' && (
          <div className="slide-in" style={{ marginTop: 12, padding: '10px 12px', background: colors.green1, borderRadius: 10, border: `1px solid ${colors.green3}` }}>
            <div style={{ fontWeight: 600, color: colors.green12, marginBottom: 4 }}>Payment ✓</div>
            <div style={{ fontSize: 13, color: colors.gray9 }}>Debit Card charged instantly at 2:30 PM. $300.00 secured.</div>
          </div>
        )}
        {expandedSeg === 'pay-out' && subState === 'in-progress' && (
          <div className="slide-in" style={{ marginTop: 12, padding: '10px 12px', background: colors.blue1, borderRadius: 10, border: `1px solid ${colors.blue3}` }}>
            <div style={{ fontWeight: 600, color: colors.blue12, marginBottom: 4 }}>We're on track! 🎉</div>
            <div style={{ fontSize: 13, color: colors.gray9 }}>Rosa's money is being processed by BBVA Mexico. Estimated arrival: <strong>6:30 PM</strong>.</div>
          </div>
        )}
      </Card>

      {subState === 'delivered' ? (
        <Banner variant="success">
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Rosa got her money! 🎉</div>
          <div style={{ fontSize: 13 }}>Delivered 43 minutes ahead of schedule. Promised by 6:30 PM · Arrived at 5:47 PM.</div>
        </Banner>
      ) : (
        <Banner variant="info">
          <div style={{ fontWeight: 600, marginBottom: 2 }}>On track! 🎉</div>
          <div style={{ fontSize: 13 }}>Rosa's $300 is being processed. We'll let you know when she receives it.</div>
        </Banner>
      )}
    </TransferShell>
  );
}
