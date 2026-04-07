import React from 'react';
import { SegmentPill } from './SegmentPill';
import { type SegmentState } from '../types';
import { colors } from '../tokens';

export interface Segment {
  id: string;
  customerLabel: string;
  devLabel: string;
  state: SegmentState;
  subLabel?: string;
  tooltip?: string;
  onClick?: () => void;
  flexGrow?: number;
  hideInCustomerView?: boolean;
}

interface LifecycleBarProps {
  segments: Segment[];
  isDevView: boolean;
  etaLine?: React.ReactNode;
  originalEta?: string;
  currentEta?: string;
  devPanel?: React.ReactNode;
  trackRecord?: string;
}

export function LifecycleBar({
  segments,
  isDevView,
  etaLine,
  originalEta,
  currentEta,
  devPanel,
  trackRecord,
}: LifecycleBarProps) {
  const visibleSegments = segments.filter(s => {
    if (!isDevView && s.hideInCustomerView) return false;
    return true;
  });

  const hasDelay = originalEta && currentEta && originalEta !== currentEta;

  return (
    <div>
      {/* ETA Display */}
      {(etaLine || originalEta) && (
        <div style={{
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 6,
        }}>
          <div>
            {etaLine ? (
              etaLine
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {hasDelay ? (
                  <>
                    <span style={{ fontSize: 13, color: colors.gray8, textDecoration: 'line-through' }}>
                      Est. {originalEta}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700, color: colors.red9 }}>
                      {currentEta}
                    </span>
                  </>
                ) : (
                  <span style={{ fontSize: 16, fontWeight: 700, color: colors.green11 }}>
                    {currentEta || originalEta}
                  </span>
                )}
              </div>
            )}
          </div>
          {trackRecord && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: colors.green1,
              border: `1px solid ${colors.green3}`,
              borderRadius: 12,
              padding: '3px 10px',
              fontSize: 11,
              color: colors.green11,
              fontWeight: 500,
            }}>
              <span>✓</span>
              <span>{trackRecord}</span>
            </div>
          )}
        </div>
      )}

      {/* Bar */}
      <div style={{
        display: 'flex',
        gap: 4,
        alignItems: 'stretch',
        background: colors.gray2,
        borderRadius: 24,
        padding: 4,
        border: `1px solid ${colors.gray3}`,
      }}>
        {visibleSegments.map((seg) => (
          <SegmentPill
            key={seg.id}
            label={seg.customerLabel}
            devLabel={seg.devLabel}
            state={seg.state}
            subLabel={seg.subLabel}
            isDevView={isDevView}
            onClick={seg.onClick}
            flexGrow={seg.flexGrow}
            tooltip={seg.tooltip}
          />
        ))}
      </div>

      {/* Dev View panel */}
      {isDevView && devPanel && (
        <div className="slide-in" style={{
          marginTop: 12,
          background: colors.blue1,
          border: `1px solid ${colors.blue3}`,
          borderRadius: 10,
          padding: '10px 14px',
          fontSize: 12,
          color: colors.blue15,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontWeight: 600, fontSize: 11 }}>
            <span>⚙️</span>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.5px', color: colors.blue10 }}>
              Dev View
            </span>
          </div>
          {devPanel}
        </div>
      )}
    </div>
  );
}
