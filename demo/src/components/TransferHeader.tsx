
import { colors } from '../tokens';

interface TransferHeaderProps {
  sender: string;
  recipient: string;
  amount: string;
  transferId: string;
  initiatedAt: string;
  payIn: string;
  payOut: string;
  isDevView: boolean;
}

export function TransferHeader({
  sender,
  recipient,
  amount,
  transferId,
  initiatedAt,
  payIn,
  payOut,
  isDevView,
}: TransferHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: colors.gray15 }}>{amount}</span>
          <span style={{ fontSize: 13, color: colors.gray8 }}>to</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: colors.gray13 }}>{recipient}</span>
        </div>
        <div style={{ fontSize: 12, color: colors.gray8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span>{isDevView ? 'Pay-In:' : 'Payment:'} {payIn}</span>
          <span>·</span>
          <span>{isDevView ? 'Pay-Out:' : 'Disbursement:'} {payOut}</span>
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: colors.gray8, fontWeight: 500 }}>{transferId}</div>
        <div style={{ fontSize: 11, color: colors.gray6 }}>Sent {initiatedAt}</div>
        {isDevView && (
          <div style={{ fontSize: 11, color: colors.gray6 }}>From: {sender}</div>
        )}
      </div>
    </div>
  );
}
