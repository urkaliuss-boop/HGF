export interface PricingItem {
  id: number;
  platform: string;
  price: number;
  color: 'green' | 'red' | 'blue';
  iconName: string;
}

export interface Testimonial {
  id: number;
  author: string;
  text: string;
  date: string;
  verified: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  role: string; // 'admin' | 'user'
  balance: number;
  created_at: string;
}

export interface PromoCode {
  id: number;
  code: string;
  amount: number;
  activations_left: number;
  created_at: string;
}
