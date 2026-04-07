export type ViewMode = 'current-cx' | 'customer' | 'dev';

export type SegmentState =
  | 'pending'
  | 'active-remitly'
  | 'active-customer'
  | 'on-track'
  | 'yellow-delay'
  | 'red-delay'
  | 'uncertain'
  | 'completed'
  | 'delivered';

export type Scenario =
  | 'send-flow'
  | 'happy'
  | 'delay'
  | 'push-funds'
  | 'risk-review'
  | 'amendment'
  | 'smb';

export type PayInMethod = 'debit-card' | 'ach' | 'push-funds';
export type PayOutMethod = 'bank-deposit' | 'push-to-card' | 'mobile-wallet' | 'cash-pickup';
