import { useState } from 'react';
import { type ViewMode } from '../types';
import { Card, ActionCard } from '../components/Card';
import { LifecycleBar, type Segment } from '../components/LifecycleBar';
import { TransferShell, SubStateNav } from '../components/TransferShell';
import { colors } from '../tokens';

interface Props { viewMode: ViewMode }

type SubState = 'stuck' | 'option-a' | 'option-b' | 'confirmed-a' | 'confirmed-b';

export function Scenario5Amendment({ viewMode }: Props) {
  const [subState, setSubState] = useState<SubState>('stuck');
  const [accountInput, setAccountInput] = useState('');
  const isDevView = viewMode === 'dev';

  const getSegments = (): Segment[] => {
    const payIn: Segment = {
      id: 'pay-in',
      customerLabel: 'Payment ✓',
      devLabel: 'Pay-In ✓',
      state: 'completed',
      subLabel: 'Debit Card',
    };

    if (subState === 'stuck') {
      return [payIn, { id: 'pay-out', customerLabel: 'Disbursement ⊙', devLabel: 'Pay-Out ⊙', state: 'active-customer', subLabel: 'Stuck — fix needed', flexGrow: 2 }];
    }
    if (subState === 'option-a' || subState === 'confirmed-a') {
      return [payIn, {
        id: 'pay-out',
        customerLabel: subState === 'confirmed-a' ? 'Disbursement ✓' : 'Disbursement',
        devLabel: subState === 'confirmed-a' ? 'Pay-Out ✓' : 'Pay-Out',
        state: subState === 'confirmed-a' ? 'active-remitly' : 'active-customer',
        subLabel: subState === 'confirmed-a' ? 'Bank Deposit · by 7:00 PM' : 'Updating account...',
        flexGrow: 2,
      }];
    }
    if (subState === 'option-b' || subState === 'confirmed-b') {
      return [payIn, {
        id: 'pay-out',
        customerLabel: subState === 'confirmed-b' ? 'Disbursement ✓' : 'Disbursement',
        devLabel: subState === 'confirmed-b' ? 'Pay-Out ✓' : 'Pay-Out',
        state: subState === 'confirmed-b' ? 'active-remitly' : 'active-customer',
        subLabel: subState === 'confirmed-b' ? 'Push to Card · by 3:20 PM' : 'Switching method...',
        flexGrow: 2,
      }];
    }
    return [payIn];
  };

  const getEtaLine = () => {
    if (subState === 'stuck') {
      return (
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.yellow13 }}>⏸ Paused</div>
          <div style={{ fontSize: 13, color: colors.gray8 }}>Choose an option below to resume</div>
        </div>
      );
    }
    if (subState === 'confirmed-a') {
      return (
        <div>
          <div style={{ fontSize: 14, color: colors.gray7, textDecoration: 'line-through' }}>6:30 PM</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.green11 }}>by 7:00 PM</div>
          <div style={{ fontSize: 13, color: colors.gray8 }}>Bank Deposit · BBVA Mexico</div>
        </div>
      );
    }
    if (subState === 'confirmed-b') {
      return (
        <div>
          <div style={{ fontSize: 14, color: colors.gray7, textDecoration: 'line-through' }}>6:30 PM</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: colors.green11 }}>by 3:20 PM 🎉</div>
          <div style={{ fontSize: 13, color: colors.green10 }}>Push to Card · nearly instant</div>
        </div>
      );
    }
    return undefined;
  };

  const devPanel = isDevView ? (
    <div style={{ fontSize: 12, color: colors.blue15, lineHeight: 1.6 }}>
      {subState === 'stuck' && (
        <>
          <div>TEC: <span style={{ fontFamily: 'monospace', color: colors.red9 }}>INVALID_ACCOUNT_NUMBER</span> (BBVA Mexico rejection)</div>
          <div>Amendment whitelist: BANK_DEPOSIT amendable for INVALID_ACCOUNT_NUMBER</div>
          <div>Pay-In preserved — only Pay-Out retried · No fee charged</div>
        </>
      )}
      {(subState === 'confirmed-a' || subState === 'option-a') && (
        <>
          <div>Amendment type: <span style={{ fontFamily: 'monospace' }}>UPDATE_ACCOUNT_NUMBER</span></div>
          <div>Pay-Out method unchanged: Bank Deposit · BBVA Mexico</div>
          <div>ETA recalculated: 6:30 PM + 5min fix buffer + 25min processing pause = 7:00 PM</div>
          <div style={{ color: colors.gray8, fontStyle: 'italic' }}>Buffer details not shown to customer</div>
        </>
      )}
      {(subState === 'confirmed-b' || subState === 'option-b') && (
        <>
          <div>Amendment type: <span style={{ fontFamily: 'monospace' }}>CHANGE_PAYOUT_METHOD</span></div>
          <div>New Pay-Out: Push to Card · Visa Direct · 10 min</div>
          <div>Self-service amendment — eliminates support ticket + cancellation</div>
          <div style={{ color: colors.green10 }}>Option B: 7:00 PM → 3:20 PM · gap: 3h 40min 🎉</div>
        </>
      )}
    </div>
  ) : undefined;

  const isOptionB = subState === 'option-b' || subState === 'confirmed-b';
  const currentPayOut = isOptionB
    ? (isDevView ? 'Pay-Out: Push to Card' : 'Push to Card · Visa Direct')
    : (isDevView ? 'Pay-Out: Bank Deposit ✓' : 'Bank Deposit · BBVA Mexico');

  const subStateNav = (
    <SubStateNav
      tabs={[
        { id: 'stuck' as SubState, label: 'Stuck — Action Needed' },
        { id: (subState === 'confirmed-a' ? 'confirmed-a' : 'option-a') as SubState, label: subState === 'confirmed-a' ? 'Option A ✓ Done' : 'Option A: Fix Account', activeColor: subState === 'confirmed-a' ? colors.green9 : undefined },
        { id: (subState === 'confirmed-b' ? 'confirmed-b' : 'option-b') as SubState, label: subState === 'confirmed-b' ? 'Option B ✓ Done' : 'Option B: Switch & Go Faster', activeColor: subState === 'confirmed-b' ? colors.green9 : undefined },
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
      transferId="#RM-3091742"
      initiatedAt="Today, 2:30 PM"
      payIn={isDevView ? 'Pay-In: Debit Card ✓' : 'Debit Card'}
      payOut={currentPayOut}
      isDevView={isDevView}
      subStateNav={subStateNav}
      accordionRows={[
        ['Transfer ID', '#RM-3091742'],
        ['Initiated', 'Today, 2:30 PM'],
        ['You sent', '$300.00'],
        ['They receive', 'MXN 5,241.00'],
        ['Exchange rate', '1 USD = 17.47 MXN'],
        ['Fee', '$3.99 USD'],
        ['Delivery method', isOptionB ? 'Push to Card · Visa Direct' : 'Bank Deposit · BBVA Mexico'],
        ['Payment method', 'Debit Card'],
      ]}
    >
      <Card>
        {/* Pay-In preservation note */}
        <div style={{
          marginBottom: 10,
          padding: '8px 12px',
          background: colors.green2,
          border: `1px solid ${colors.green8}`,
          borderRadius: 8,
          fontSize: 12,
          color: colors.green12,
        }}>
          ✓ Your payment is already processed — no restart, no extra fee.
        </div>

        {/* Error banner */}
        {(subState === 'stuck' || subState === 'option-a' || subState === 'option-b') && (
          <div style={{
            marginBottom: 12,
            padding: '10px 12px',
            background: colors.amberLight,
            border: `1px solid ${colors.amber}`,
            borderRadius: 10,
            fontSize: 13,
            color: colors.yellow13,
          }}>
            💙 Rosa's bank account number wasn't accepted by BBVA Mexico — looks like there might be a typo. Fix it below and her money will be on its way.
          </div>
        )}

        <LifecycleBar
          segments={getSegments()}
          isDevView={isDevView}
          etaLine={getEtaLine()}
          devPanel={devPanel}
        />

        {/* Amendment options */}
        {subState === 'stuck' && (
          <div className="slide-in" style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.gray10, marginBottom: 2 }}>
              Choose how to continue:
            </div>
            <ActionCard
              title="Option A — Fix account number"
              description="Keep Bank Deposit · BBVA Mexico. Correct Rosa's account number and we'll send it right away."
              eta="Estimated delivery: by 7:00 PM"
              badge="Bank Deposit"
              ctaLabel="Update account number"
              onCta={() => setSubState('option-a')}
            />
            <ActionCard
              title="Option B — Switch to Push to Card"
              description="Switch to Visa Direct — Rosa gets her $300 in minutes, not hours. At no extra cost."
              eta="Estimated delivery: by about 3:20 p.m. 🎉"
              badge="Nearly instant · Free"
              badgeColor={colors.green9}
              highlight={true}
              wow="⚡ 3h 40min faster than Option A"
              ctaLabel="Switch and send faster"
              onCta={() => setSubState('option-b')}
            />
          </div>
        )}

        {/* Option A form */}
        {subState === 'option-a' && (
          <div className="slide-in" style={{ marginTop: 12, padding: '12px 14px', background: colors.gray1, border: `1px solid ${colors.gray3}`, borderRadius: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 8, color: colors.gray13 }}>Update Rosa's bank account number</div>
            <input
              type="text"
              placeholder="Enter correct account number"
              value={accountInput}
              onChange={e => setAccountInput(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${colors.gray4}`, fontSize: 14, marginBottom: 8, outline: 'none' }}
            />
            <button
              onClick={() => setSubState('confirmed-a')}
              style={{ width: '100%', background: colors.gray13, color: '#fff', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600 }}
            >
              Confirm
            </button>
          </div>
        )}

        {/* Option B confirmation */}
        {subState === 'option-b' && (
          <div className="slide-in" style={{ marginTop: 12, padding: '12px 14px', background: colors.blue1, border: `1.5px solid ${colors.blue6}`, borderRadius: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 6, color: colors.blue12 }}>Switch Rosa's delivery to Push to Card</div>
            <div style={{ fontSize: 13, color: colors.gray9, marginBottom: 10 }}>
              She'll get her $300 in minutes, at no extra cost to you. Her updated delivery: <strong>by about 3:20 p.m.</strong>.
            </div>
            <button
              onClick={() => setSubState('confirmed-b')}
              style={{ width: '100%', background: colors.blue7, color: '#fff', borderRadius: 8, padding: '10px', fontSize: 14, fontWeight: 600 }}
            >
              Confirm switch
            </button>
          </div>
        )}

        {/* Confirmed states */}
        {subState === 'confirmed-a' && (
          <div className="slide-in" style={{ marginTop: 12, padding: '12px 14px', background: colors.green2, border: `1px solid ${colors.green8}`, borderRadius: 10 }}>
            <div style={{ fontWeight: 600, color: colors.green12, marginBottom: 4 }}>✓ You're all set!</div>
            <div style={{ fontSize: 13, color: colors.gray9 }}>
              Rosa's updated account details are confirmed — her money is on its way and should arrive by <strong>7:00 PM</strong>.
            </div>
          </div>
        )}
        {subState === 'confirmed-b' && (
          <div className="slide-in" style={{ marginTop: 12, padding: '12px 14px', background: colors.green2, border: `1px solid ${colors.green8}`, borderRadius: 10 }}>
            <div style={{ fontWeight: 600, color: colors.green12, marginBottom: 4 }}>🎉 Done!</div>
            <div style={{ fontSize: 13, color: colors.gray9 }}>
              We've switched Rosa's delivery to Push to Card. She'll get her money by <strong>3:20 PM</strong> — in just a few minutes.
            </div>
            {isDevView && (
              <div style={{ marginTop: 6, fontSize: 11, color: colors.gray8 }}>
                ⚙️ Gap vs Option A: 7:00 PM → 3:20 PM = 3h 40min · Self-service amendment — no support ticket needed
              </div>
            )}
          </div>
        )}
      </Card>
    </TransferShell>
  );
}
