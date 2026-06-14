export interface LeadPreview {
  store_name: string;
  url: string;
  country: string;
  signal: string;
  niche?: string;
}

export interface PreviewResponse {
  dataset_id: string;
  items: LeadPreview[];
  total_count: number;
  price_inr?: number;
  price_usd?: number;
  niche?: string;
  country?: string;
  signal?: string;
  niches?: string[];
  countries?: string[];
  signal_ids?: string[];
  signal_names?: string[];
}

export interface CatalogResponse {
  niches: string[];
  countries: string[];
  signals: { id: string; name: string; description?: string | null }[];
}

export interface SignalOption {
  id: string;
  name: string;
  description?: string | null;
}
