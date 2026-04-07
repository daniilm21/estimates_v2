import { useState } from 'react';
import { type ViewMode } from '../types';
import { Card, Banner } from '../components/Card';
import { LifecycleBar, type Segment } from '../components/LifecycleBar';
import { TransferShell, SubStateNav } from '../components/TransferShell';
import { colors } from '../tokens';

interface Props { viewMode: ViewMode }

type Step = '1' | '2' | '3';

export function Scenario4Risk({ viewMode }: Props) {
  const [step, setStep] = useState<Step>('1');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const isDevView = viewMode === 'dev';

  const getSegments = (): Segment[] => {
    const payIn: Segment = {
      id: 'pay-in',
      customerLabel: 'Payment ✓',
      devLabel: 'Pay-In ✓',
      state: 'completed',
      subLabel: 'Debit Card',
    };
    const payOut: Segment = {
      id: 'pay-out',
      customerLabel: 'Disbursement',
      devLabel: 'Pay-Out',
      state: 'pending',
      subLabel: '4h once cleared',
      flexGrow: 2,
    };

    if (step === '1') {
      return [
        payIn,
        { id: 'risk', customerLabel: 'Review ?', devLabel: 'Risk ?', state: 'uncertain', subLabel: 'Remitly reviewing' },
        payOut,
      ];
    }
    if (step === '2') {
      return [
        payIn,
        { id: 'risk-1', customerLabel: 'Review ✓', devLabel: 'Risk step 1 ✓', state: 'completed', subLabel: 'Initial review' },
        { id: 'risk-2', customerLabel: 'Your Action', devLabel: 'Risk: Upload', state: 'active-customer', subLabel: 'Doc needed', onClick: () => setShowUploadForm(!showUploadForm) },
        { id: 'risk-3', customerLabel: 'Review', devLabel: 'Risk step 3', state: 'pending', subLabel: 'After upload' },
        payOut,
      ];
    }
    return [
      payIn,
      { id: 'risk-1', customerLabel: 'Review ✓', devLabel: 'Risk step 1 ✓', state: 'completed', subLabel: 'Done' },
      { id: 'risk-2', customerLabel: 'Docs ✓', devLabel: 'Upload ✓', state: 'completed', subLabel: 'Received' },
      { id: 'risk-3', customerLabel: 'Review', devLabel: 'Risk step 3', state: 'active-remitly', subLabel: '15 min' },
      payOut,
    ];
  };

  const stepLabels: Record<Step, string> = {
    '1': 'Step 1: Reviewing',
    '2': 'Step 2: Action needed',
    '3': 'Step 3: Docs received',
  };

  const etaLine = (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, color: step === '1' ? colors.yellow13 : colors.gray11 }}>
        {step === '1' ? 'about 6:57 PM' : step === '2' ? 'about 4h after upload' : 'by about 7:15 p.m.'}
      </div>
      <div style={{ fontSize: 13, color: colors.gray8 }}>
        {step === '1'
          ? 'May shift depending on review'
          : step === '2'
          ? 'Upload now to keep Rosa on track'
          : 'Almost there — reviewing your docs'}
      </div>
    </div>
  );

  const devPanel = isDevView ? (
    <div style={{ fontSize: 12, color: colors.blue15, lineHeight: 1.6 }}>
      {step === '1' && (
        <>
          <div><span style={{ fontFamily: 'monospace' }}>original_estimate</span> = 4h → 6:30 PM</div>
          <div><span style={{ fontFamily: 'monospace' }}>current_estimate</span> = 4h 27min → 6:57 PM (+11.25%) — cause unknown</div>
          <div>TUS: <span style={{ fontFamily: 'monospace' }}>REVIEW_IN_PROGRESS</span> · sideline_type: STANDARD</div>
          <div style={{ marginTop: 4, color: colors.yellow13 }}>⚠ No refund committed — delay cause unknown (may be customer-caused)</div>
        </>
      )}
      {step === '2' && (
        <>
          <div>TUS: <span style={{ fontFamily: 'monospace' }}>DOCS_REQUESTED</span> · review step: 2/3</div>
          <div>Requested: Government ID or proof of address</div>
          <div>ETA resumes 4h from doc receipt</div>
        </>
      )}
      {step === '3' && (
        <>
          <div>TUS: <span style={{ fontFamily: 'monospace' }}>DOCS_RECEIVED</span> · review step: 3/3</div>
          <div>Documents received — Remitly compliance team reviewing</div>
          <div>Expected review time: 15 min · ETA: 4h after clearance</div>
        </>
      )}
    </div>
  ) : undefined;

  const subStateNav = (
    <SubStateNav
      tabs={(['1', '2', '3'] as Step[]).map(s => ({ id: s, label: stepLabels[s] }))}
      active={step}
      onChange={(s) => { setStep(s); setShowUploadForm(false); }}
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
          segments={getSegments()}
          isDevView={isDevView}
          etaLine={etaLine}
          devPanel={devPanel}
        />

        {step === '2' && showUploadForm && (
          <div className="slide-in" style={{
            marginTop: 12,
            padding: '12px 14px',
            background: colors.amberLight,
            border: `1px solid ${colors.amber}`,
            borderRadius: 10,
          }}>
            <div style={{ fontWeight: 600, color: colors.yellow13, marginBottom: 6 }}>
              Rosa's money is on hold — we need a document from you to continue
            </div>
            <div style={{ fontSize: 13, color: colors.gray9, marginBottom: 8 }}>
              Please upload one of: Government-issued ID, Proof of address, or Bank statement
            </div>
            <button style={{
              background: colors.amber,
              color: '#fff',
              borderRadius: 8,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
            }}>
              📎 Upload Document
            </button>
          </div>
        )}
      </Card>

      <Banner variant={step === '1' ? 'warning' : step === '2' ? 'customer' : 'info'}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>
          {step === '1' ? "We're reviewing your transfer" :
           step === '2' ? "Rosa's money is on hold — your action needed" :
           "Documents received — almost there!"}
        </div>
        <div style={{ fontSize: 13 }}>
          {step === '1'
            ? "We're reviewing your transfer — this usually takes about 27 minutes. We'll update you as soon as we know more."
            : step === '2'
            ? "The sooner you upload, the sooner Rosa gets her money. After you upload, Rosa's money should arrive within about 4 hours. Upload now."
            : "We've received your documents — our team is reviewing them now. This usually takes about 15 minutes. Rosa's money is next!"}
        </div>
      </Banner>
    </TransferShell>
  );
}
