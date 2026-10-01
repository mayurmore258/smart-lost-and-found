export type ItemCategory = 'Bags' | 'Phones' | 'Wallets' | 'Keys' | 'IDs & Cards' | 'Earbuds' | 'Glasses & Watches' | 'Other';

export type ReportType = 'lost' | 'found';

export type ReportStatus = 'active' | 'looking_for_match' | 'potential_match' | 'verification' | 'resolved' | 'closed';

export interface BaseItem {
  id?: string;
  item_id?: string;
  title?: string;
  description: string;
  category: ItemCategory | string;
  color: string;
  brand?: string;
  location: string;
  date_time: string;
  image_url?: string;
  image?: File | null;
  status?: ReportStatus;
  created_at?: string;
}

export interface LostItemReport extends BaseItem {
  type: 'lost';
}

export interface FoundItemReport extends BaseItem {
  type: 'found';
}

export interface MatchCandidate {
  found_item_id: string;
  title?: string;
  category?: string;
  location?: string;
  date_time?: string;
  image_url?: string;
  description?: string;
  similarity?: number;
  assessment?: 'potential_match' | 'high_match' | 'low_match';
  reasons: string[];
}

export interface MatchResponse {
  item_id: string;
  status: string;
  matches: MatchCandidate[];
}

export interface VerificationQuestion {
  match_id: string;
  question: string;
  hint?: string;
}

export interface VerificationResult {
  match_id: string;
  status: 'verified' | 'failed' | 'pending';
  message?: string;
}

export type ThemeMode = 'light' | 'dark';
