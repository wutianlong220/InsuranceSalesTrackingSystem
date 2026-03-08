export interface Customer {
  id: number;
  name: string;
  gender: 'male' | 'female' | null;
  phone: string | null;
  address: string | null;
  birthday: string | null;
  occupation: string | null;
  family_info: string | null;
  source: 'orphan' | 'referral' | 'self';
  was_referred_by: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerWithStats extends Customer {
  deal_count: number;
  status: string;
  last_contact: string | null;
  referrer?: Customer;
}

export interface CreateCustomerInput {
  name: string;
  gender?: 'male' | 'female';
  phone?: string;
  address?: string;
  birthday?: string;
  occupation?: string;
  family_info?: string;
  source: 'orphan' | 'referral' | 'self';
  was_referred_by?: number;
  notes?: string;
}

export interface UpdateCustomerInput extends Partial<CreateCustomerInput> {
  id: number;
}
