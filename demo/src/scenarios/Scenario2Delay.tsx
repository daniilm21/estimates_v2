import { useState } from 'react';
import { type ViewMode } from '../types';
import { Card, Banner } from '../components/Card';
import { LifecycleBar, type Segment } from '../components/LifecycleBar';
import { TransferShell, SubStateNav } from '../components/TransferShell';
import { colors } from '../tokens';

interface Props { viewMode: ViewMode }

type SubState = 'yellow' | 'red';

export function Scenario2Delay({ viewMode }: Props) {
  const [subState, setSubState] = useState<SubState>('yellow');
  const isDevView = viewMode === 'dev';

  const isYellow = subState === 'yellow';

  const segments: Segment[] = [
    {
      id: 'pay-in',
      customerLabel: 'Payment ✓',
      devLabel: 'Pay-In ✓',
      state: 'completed',
      subLabel: 'Debit Card',
    },
    {
      id: 'pay-out',
      customerLabel: 'Disbursement ⚠',
      devLabel: isYellow ? 'Pay-Out ⚠' : 'Pay-Out ⚠',
      state: isYellow ? 'yellow-delay' : 'red-delay',
      subLabel: isYellow ? '+20 min late' : '+30 min late',
      flexGrow: 2,
    },
  ];

  const devPanel = isDevView ? (
    <div style={{ fontSize: 12, color: colors.blue15, lineHeight: 1.7 }}>
      <div><span style={{ fontFamily: 'monospace' }}>original_estimate</span> = 4h → <strong>6:30 PM</strong></div>
      <div><span style={{ fontFamily: 'monospace' }}>current_estimate</span> = {isYellow ? '4h 20min → 6:50 PM (+8.3%)' : '4h 30min → 7:00 PM (+12.5%)'}</div>
      <div style={{ marginTop: 6, borderTop: `1px solid ${colors.blue3}`, paddingTop: 6 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>What happened behind the scenes:</div>
        {isYellow ? (
          <>
            <div>🕐 <strong>6:34 PM</strong> — current_estimate recalculated: +20 min (yellow threshold: &gt;0% relative + ≥2 min absolute)</div>
            <div>📱 <strong>6:34 PM</strong> — push notification sent to Carlos: "Heads up — running 20 min behind"</div>
            <div>💳 <strong>6:34 PM</strong> — $2 credit queued for Carlos' next transaction</div>
          </>
        ) : (
          <>
            <div>🕐 <strong>6:34 PM</strong> — yellow threshold crossed → push notification + $2 credit</div>
            <div>🔴 <strong>6:41 PM</strong> — current_estimate: +30 min (red threshold: ≥10% relative + ≥5 min absolute)</div>
            <div>📱 <strong>6:41 PM</strong> — push notification sent: "We're sorry — delayed by 30 min"</div>
            <div>💰 <strong>6:41 PM</strong> — fee refund of $3.99 triggered automatically</div>
          </>
        )}
        <div style={{ marginTop: 4, fontSize: 11, color: colors.blue10, fontStyle: 'italic' }}>
          Customers informed before they ask "where's my money?" — estimates drive proactive outreach.
        </div>
      </div>
    </div>
  ) : undefined;

  const subStateNav = (
    <SubStateNav
      tabs={[
        { id: 'yellow' as SubState, label: 'Yellow — Slight Delay', activeColor: colors.yellow8 },
        { id: 'red' as SubState, label: 'Red — Significant Delay', activeColor: colors.red8 },
      ]}
      active={subState}
      onChange={setSubState}
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
          etaLine={
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 14, color: colors.gray7, textDecoration: 'line-through' }}>6:30 PM</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: isYellow ? colors.yellow13 : colors.red9 }}>
                  {isYellow ? '6:50 PM' : '7:00 PM'}
                </span>
                <span style={{ fontSize: 13, color: isYellow ? colors.yellow13 : colors.red9 }}>
                  {isDevView
                    ? (isYellow ? '+20 min · +8.3%' : '+30 min · +12.5%')
                    : (isYellow ? 'about 20 minutes late' : 'about 30 minutes late')
                  }
                </span>
              </div>
            </div>
          }
          devPanel={devPanel}
        />

        {/* Credit/refund notice */}
        <div className="slide-in" style={{
          marginTop: 12,
          padding: '10px 12px',
          background: isYellow ? colors.blue1 : colors.red1,
          borderRadius: 10,
          border: `1px solid ${isYellow ? colors.blue3 : colors.red3}`,
          fontSize: 13,
          color: isYellow ? colors.blue12 : colors.red9,
        }}>
          {isYellow ? (
            <>💙 As a thank-you for your patience, we've added a <strong>$2 credit</strong> to your next transfer.</>
          ) : (
            <>💙 This delay is on us. We're refunding your <strong>$3.99 fee</strong> in full.</>
          )}
        </div>
      </Card>

      <Banner variant={isYellow ? 'warning' : 'error'}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {isYellow ? 'Heads up — slight delay ⏳' : 'We\'re sorry — significant delay ⚠️'}
        </div>
        <div style={{ fontSize: 13 }}>
          {isYellow
            ? "Rosa's money is running about 20 minutes behind. We expect it to arrive by 6:50 PM."
            : "Rosa's money will be delayed by about 30 minutes. New estimated arrival: 7:00 PM. This one's on us."}
        </div>
      </Banner>
    </TransferShell>
  );
}
