export interface PurchaseItem {
  id: string;
  dataset_id: string;
  niche: string;
  country: string;
  signal: string;
  total_leads: number;
  price_inr?: number;
  price_usd?: number;
  payment_method?: string;
  purchase_date: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  niches: string[];
  countries: string[];
  signalIds: string[];
  signalNames: string[];
  timestamp: string;
}

export interface ProfileData {
  name: string;
  org: string;
  purpose: string;
  phone: string;
}
