import React from 'react';
import { colors } from '../tokens';

// ─── iOS Status Bar ───────────────────────────────────────────────────────────
export function StatusBar({ time = '9:41' }: { time?: string }) {
  return (
    <div style={{
      height: 44,
      padding: '12px 20px 0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'transparent',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 15, fontWeight: 600, color: colors.gray15, letterSpacing: '-0.3px' }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Signal bars */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          <rect x="0" y="6" width="3" height="6" rx="1" fill={colors.gray15} />
          <rect x="4.5" y="4" width="3" height="8" rx="1" fill={colors.gray15} />
          <rect x="9" y="2" width="3" height="10" rx="1" fill={colors.gray15} />
          <rect x="13.5" y="0" width="3" height="12" rx="1" fill={colors.gray15} />
        </svg>
        {/* Wifi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
          <path d="M8 9.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3z" fill={colors.gray15}/>
          <path d="M3.5 6.5a6.5 6.5 0 019 0" stroke={colors.gray15} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
          <path d="M1 3.5a10.5 10.5 0 0114 0" stroke={colors.gray15} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        </svg>
        {/* Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <div style={{ width: 22, height: 11, border: `1px solid ${colors.gray15}`, borderRadius: 3, padding: '1.5px', display: 'flex' }}>
            <div style={{ flex: 1, background: colors.gray15, borderRadius: 1.5 }} />
          </div>
          <div style={{ width: 2, height: 5, background: colors.gray15, borderRadius: 1 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Remitly Nav Bar (Send Flow style — shield logo + close) ──────────────────
export function RemitlyNavBar({ title, onClose }: { title?: string; onClose?: () => void }) {
  return (
    <div style={{
      height: 48,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      background: '#fff',
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Left — spacer or back */}
      <div style={{ width: 32 }} />

      {/* Center — shield logo or title */}
      {title ? (
        <span style={{ fontSize: 16, fontWeight: 600, color: colors.gray15, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {title}
        </span>
      ) : (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <RemitlyShield />
        </div>
      )}

      {/* Right — close ✕ */}
      <button
        onClick={onClose}
        style={{ width: 32, height: 32, borderRadius: '50%', background: colors.gray2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.gray12, fontSize: 16 }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Transfer Detail Nav Bar (back arrow + title) ─────────────────────────────
export function TransferNavBar({ title = 'Transfer details', onBack }: { title?: string; onBack?: () => void }) {
  return (
    <div style={{
      height: 48,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      background: '#fff',
      flexShrink: 0,
      borderBottom: `1px solid ${colors.gray3}`,
      gap: 8,
    }}>
      <button onClick={onBack} style={{ color: '#226ba4', fontSize: 17, display: 'flex', alignItems: 'center', gap: 2, fontWeight: 400 }}>
        <span style={{ fontSize: 22, lineHeight: 1, marginTop: -1 }}>‹</span>
        <span style={{ fontSize: 16 }}>Back</span>
      </button>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 600, color: colors.gray15, marginRight: 48 }}>
        {title}
      </div>
    </div>
  );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
const tabs = [
  { icon: '⊙', label: 'Home' },
  { icon: '↕', label: 'Activity' },
  { icon: '➤', label: 'Send', active: false },
  { icon: '👤', label: 'Account' },
];

export function BottomTabBar({ activeTab = 'Activity' }: { activeTab?: string }) {
  return (
    <div style={{
      height: 64,
      background: '#fff',
      borderTop: `1px solid ${colors.gray3}`,
      display: 'flex',
      alignItems: 'flex-start',
      paddingTop: 8,
      flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isActive = tab.label === activeTab;
        return (
          <div key={tab.label} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}>
            <div style={{ fontSize: 20, color: isActive ? '#226ba4' : colors.gray6 }}>
              {tab.label === 'Home' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12L12 3l9 9" stroke={isActive ? '#226ba4' : colors.gray6} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10" stroke={isActive ? '#226ba4' : colors.gray6} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              )}
              {tab.label === 'Activity' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="17" rx="2" stroke={isActive ? '#226ba4' : colors.gray6} strokeWidth="2" fill="none"/>
                  <path d="M8 2v4M16 2v4M3 10h18" stroke={isActive ? '#226ba4' : colors.gray6} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              )}
              {tab.label === 'Send' && (
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: '#226ba4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginTop: -16,
                  boxShadow: '0 2px 8px rgba(34,107,164,0.35)',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
              {tab.label === 'Account' && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke={isActive ? '#226ba4' : colors.gray6} strokeWidth="2" fill="none"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={isActive ? '#226ba4' : colors.gray6} strokeWidth="2" strokeLinecap="round" fill="none"/>
                </svg>
              )}
            </div>
            {tab.label !== 'Send' && (
              <span style={{ fontSize: 10, color: isActive ? '#226ba4' : colors.gray6, fontWeight: isActive ? 600 : 400 }}>
                {tab.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Remitly Shield SVG ───────────────────────────────────────────────────────
export function RemitlyShield({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 36" fill="none">
      <path d="M16 0L0 6v12c0 9.9 6.8 19.2 16 22 9.2-2.8 16-12.1 16-22V6L16 0z" fill="#226ba4"/>
      <path d="M10 14h5v2l3-4 3 4v-2h1v8h-1v-4l-3 4-3-4v4h-5v-8z" fill="white" fillRule="evenodd" clipRule="evenodd"/>
    </svg>
  );
}

// ─── Full app frame wrapper ───────────────────────────────────────────────────
interface AppFrameProps {
  children: React.ReactNode;
  navBar?: React.ReactNode;
  bottomBar?: React.ReactNode;
  statusBarTime?: string;
  bgColor?: string;
}

export function AppFrame({ children, navBar, bottomBar, statusBarTime, bgColor = '#fff' }: AppFrameProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: bgColor,
      overflow: 'hidden',
    }}>
      <StatusBar time={statusBarTime} />
      {navBar}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {children}
      </div>
      {bottomBar}
    </div>
  );
}
