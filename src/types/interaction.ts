export interface Interaction {
  id: number;
  customer_id: number;
  type: 'call' | 'wechat' | 'meet' | 'platform' | 'deal' | 'referral';
  date: string;
  content: string;
  next_step: string | null;
  referral_id: number | null;
  created_at: string;
}

export interface CreateInteractionInput {
  customer_id: number;
  type: 'call' | 'wechat' | 'meet' | 'platform' | 'deal' | 'referral';
  date: string;
  content: string;
  next_step?: string;
  referral_id?: number;
}

export interface UpdateInteractionInput extends Partial<CreateInteractionInput> {
  id: number;
}
