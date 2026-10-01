export type ItemCategory = 'Bags' | 'Phones' | 'Wallets' | 'Keys' | 'IDs & Cards' | 'Earbuds' | 'Glasses & Watches' | 'Other';

export type ReportType = 'lost' | 'found';

export type ReportStatus = 'active' | 'potential_match' | 'verified' | 'resolved' | 'closed';

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
  image_path?: string;
  image?: File | null;
  status?: ReportStatus | string;
  created_at?: string;
  type?: ReportType;
}

export interface LostItemReport extends BaseItem {
  type: 'lost';
}

export interface FoundItemReport extends BaseItem {
  type: 'found';
}

export interface ItemResponse {
  id: string;
  item_id?: string;
  type: 'lost' | 'found';
  description: string;
  category: string;
  color: string;
  brand?: string | null;
  location: string;
  date_time: string;
  image_path: string;
  status: string;
  created_at: string;
}

export interface MatchCandidate {
  id?: string;
  found_item_id: string;
  similarity: number;
  assessment: string;
  reasons: string[];
  title?: string;
  category?: string;
  location?: string;
  date_time?: string;
  image_url?: string;
  description?: string;
  status?: string;
}

export interface MatchResponse {
  item_id: string;
  status: string;
  matches: MatchCandidate[];
}

export interface MatchDetail {
  id: string;
  lost_item_id: string;
  found_item_id: string;
  similarity: number;
  assessment: string;
  reasons: string[];
  status: string;
  created_at: string;
  title?: string;
  category?: string;
  location?: string;
  date_time?: string;
  image_url?: string;
  description?: string;
}

export interface ItemMatchesListResponse {
  item_id: string;
  item_status: string;
  total_matches: number;
  matches: MatchDetail[];
}

export interface VerificationQuestionResponse {
  match_id: string;
  question: string;
  verified: boolean;
}

export interface VerificationResult {
  match_id?: string;
  verified: boolean;
  status?: 'verified' | 'failed' | 'pending';
  message?: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export type ThemeMode = 'light' | 'dark';
