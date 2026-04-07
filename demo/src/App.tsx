import { useState } from 'react';
import { type ViewMode, type Scenario } from './types';
import { colors } from './tokens';
import { AppFrame, RemitlyNavBar, TransferNavBar, BottomTabBar } from './components/AppChrome';

// New CX scenarios
import { SendFlow } from './scenarios/SendFlow';
import { Scenario1Happy } from './scenarios/Scenario1Happy';
import { Scenario2Delay } from './scenarios/Scenario2Delay';
import { Scenario3PushFunds } from './scenarios/Scenario3PushFunds';
import { Scenario4Risk } from './scenarios/Scenario4Risk';
import { Scenario5Amendment } from './scenarios/Scenario5Amendment';
import { Scenario6SMB } from './scenarios/Scenario6SMB';

// Current CX screens
import { CurrentCXSendFlow } from './scenarios/CurrentCXSendFlow';
import { CurrentCXTransferDetail } from './scenarios/CurrentCXTransferDetail';

type SendFlowScreen = 'calculator' | 'summary';

const tabs: { id: Scenario; label: string }[] = [
  { id: 'send-flow',   label: 'Send Flow' },
  { id: 'happy',       label: '1. Happy' },
  { id: 'delay',       label: '2. Delay' },
  { id: 'push-funds',  label: '3. Push Funds' },
  { id: 'risk-review', label: '4. Risk Review' },
  { id: 'amendment',   label: '5. Amendment' },
  { id: 'smb',         label: '6. SMB' },
];

const VIEW_MODES: { id: ViewMode; label: string; sublabel: string }[] = [
  { id: 'current-cx', label: 'Current CX',       sublabel: 'Remitly today' },
  { id: 'customer',   label: 'New CX',            sublabel: 'Customer view' },
  { id: 'dev',        label: 'New CX + Dev',      sublabel: 'Internal details' },
];

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('current-cx');
  const [activeTab, setActiveTab] = useState<Scenario>('send-flow');
  const [sendFlowScreen, setSendFlowScreen] = useState<SendFlowScreen>('calculator');

  const isCurrentCX = viewMode === 'current-cx';
  const isDevView = viewMode === 'dev';
  const isSendFlow = activeTab === 'send-flow';
  const isSummary = isSendFlow && sendFlowScreen === 'summary';

  const handleTabChange = (tab: Scenario) => {
    setActiveTab(tab);
    setSendFlowScreen('calculator');
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setSendFlowScreen('calculator');
  };

  const handleSendFlowSubmit = (scenario: Scenario) => {
    setActiveTab(scenario);
    setSendFlowScreen('calculator');
  };

  const transferTitle = activeTab === 'smb' ? 'Batch #RM-5193847' : 'Transfer #RM-2847561';

  const sendFlowNavBar = isSummary
    ? <TransferNavBar title="Review and send" onBack={() => setSendFlowScreen('calculator')} />
    : <RemitlyNavBar />;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#c8d0da',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px 12px 48px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    }}>

      {/* ── Demo controls (outside phone) ──────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 430, marginBottom: 14 }}>

        {/* Branding row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 30, height: 30, background: '#226ba4', borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 15,
            }}>R</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#1a2530' }}>Remitly</div>
              <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>Estimates v2 — Demo</div>
            </div>
          </div>
        </div>

        {/* 3-way view toggle */}
        <div style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(10px)',
          border: `1px solid rgba(255,255,255,0.9)`,
          borderRadius: 16,
          padding: 4,
          display: 'flex',
          gap: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          {VIEW_MODES.map(mode => {
            const active = viewMode === mode.id;
            const bg = mode.id === 'current-cx' ? '#263647'
              : mode.id === 'customer' ? '#13aae5'
              : '#226ba4';
            return (
              <button
                key={mode.id}
                onClick={() => handleViewModeChange(mode.id)}
                style={{
                  flex: 1,
                  padding: '9px 4px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  background: active ? bg : 'transparent',
                  color: active ? '#fff' : colors.gray9,
                  transition: 'all 0.15s',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                <div style={{ fontSize: 12 }}>{mode.label}</div>
                <div style={{ fontSize: 10, opacity: active ? 0.75 : 0.5, marginTop: 1 }}>{mode.sublabel}</div>
              </button>
            );
          })}
        </div>

        {/* Dev info bar */}
        {isDevView && (
          <div className="slide-in" style={{
            marginTop: 8,
            background: '#e6f3ff',
            border: `1px solid #d2ecff`,
            borderRadius: 10,
            padding: '7px 12px',
            fontSize: 12,
            color: '#1f284a',
            lineHeight: 1.5,
          }}>
            ⚙️ <strong>Dev View</strong> — Treasury visible. Labels: Pay-In / Pay-Out / Risk.
          </div>
        )}
      </div>

      {/* ── Scenario tab bar (above phone) ─────────────────────────────── */}
      <div style={{ width: '100%', maxWidth: 430 }}>
        <div style={{
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '14px 14px 0 0',
          padding: '8px 8px 0',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          border: '1px solid rgba(255,255,255,0.85)',
          borderBottom: 'none',
        }}>
          <div style={{ display: 'flex', gap: 2, minWidth: 'max-content' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  padding: '7px 11px',
                  borderRadius: '10px 10px 0 0',
                  fontSize: 12,
                  fontWeight: activeTab === tab.id ? 700 : 400,
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id
                    ? (tab.id === 'send-flow' ? '#226ba4' : '#263647')
                    : colors.gray8,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s',
                  borderBottom: activeTab === tab.id ? '2px solid #fff' : '2px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Phone frame ─────────────────────────────────────────────────── */}
      <div style={{
        width: '100%',
        maxWidth: 430,
        height: 724,
        borderRadius: '0 0 44px 44px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        border: '1px solid rgba(0,0,0,0.08)',
        display: 'flex',
        flexDirection: 'column',
        background: '#fff',
      }}>
        <div
          key={`${viewMode}-${activeTab}`}
          className="fade-in"
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {isCurrentCX ? (
            /* ── Current CX ─────────────────────────────────────────────── */
            <AppFrame
              navBar={isSendFlow
                ? sendFlowNavBar
                : <TransferNavBar title="Transfer details" />
              }
              bottomBar={<BottomTabBar activeTab={isSendFlow ? 'Send' : 'Activity'} />}
              bgColor="#f5f6f8"
            >
              {isSendFlow
                ? <CurrentCXSendFlow
                    onSubmit={handleSendFlowSubmit}
                    screen={sendFlowScreen}
                    onScreenChange={setSendFlowScreen}
                  />
                : <CurrentCXTransferDetail scenario={activeTab} />
              }
            </AppFrame>
          ) : (
            /* ── New CX (Customer or Dev) ────────────────────────────────── */
            <AppFrame
              navBar={isSendFlow
                ? sendFlowNavBar
                : <TransferNavBar title={transferTitle} />
              }
              bottomBar={<BottomTabBar activeTab={isSendFlow ? 'Send' : 'Activity'} />}
              bgColor={isSendFlow ? '#fff' : '#f5f6f8'}
            >
              {activeTab === 'send-flow' && (
                <SendFlow
                  viewMode={viewMode}
                  onSubmit={handleSendFlowSubmit}
                  screen={sendFlowScreen}
                  onScreenChange={setSendFlowScreen}
                />
              )}
              {activeTab === 'happy'       && <Scenario1Happy viewMode={viewMode} />}
              {activeTab === 'delay'       && <Scenario2Delay viewMode={viewMode} />}
              {activeTab === 'push-funds'  && <Scenario3PushFunds viewMode={viewMode} />}
              {activeTab === 'risk-review' && <Scenario4Risk viewMode={viewMode} />}
              {activeTab === 'amendment'   && <Scenario5Amendment viewMode={viewMode} />}
              {activeTab === 'smb'         && <Scenario6SMB viewMode={viewMode} />}
            </AppFrame>
          )}
        </div>
      </div>

      {/* iPhone home indicator */}
      <div style={{ width: 134, height: 5, background: 'rgba(0,0,0,0.15)', borderRadius: 3, marginTop: 10 }} />

      <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(0,0,0,0.28)', textAlign: 'center' }}>
        Estimates v2 Demo · Remitly · All data hardcoded
      </div>
    </div>
  );
}

export default App;
