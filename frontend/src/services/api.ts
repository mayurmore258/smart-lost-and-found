import { MatchResponse, VerificationResult } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Helper for making API requests with standard error handling
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || errorData.detail || `Server returned status ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    console.warn(`[API] Request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const apiService = {
  /**
   * 1. Create Lost Report (POST /items/lost)
   */
  async createLostReport(formData: FormData): Promise<{ item_id: string; status: string }> {
    return apiFetch<{ item_id: string; status: string }>('/items/lost', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * 2. Create Found Report (POST /items/found)
   */
  async createFoundReport(formData: FormData): Promise<{ item_id: string; status: string }> {
    return apiFetch<{ item_id: string; status: string }>('/items/found', {
      method: 'POST',
      body: formData,
    });
  },

  /**
   * 3. Find Matches (POST /items/{item_id}/match)
   */
  async findMatches(itemId: string): Promise<MatchResponse> {
    return apiFetch<MatchResponse>(`/items/${itemId}/match`, {
      method: 'POST',
    });
  },

  /**
   * 4. Get Matches (GET /matches/{item_id})
   */
  async getMatches(itemId: string): Promise<MatchResponse> {
    return apiFetch<MatchResponse>(`/matches/${itemId}`);
  },

  /**
   * 5. Verification (POST /matches/{match_id}/verify)
   */
  async verifyOwnership(matchId: string, answer: string): Promise<VerificationResult> {
    return apiFetch<VerificationResult>(`/matches/${matchId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });
  },

  /**
   * 6. Update Item Status (PATCH /items/{item_id}/status)
   */
  async updateItemStatus(itemId: string, status: string): Promise<{ item_id: string; status: string }> {
    return apiFetch<{ item_id: string; status: string }>(`/items/${itemId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
  },

  /**
   * 7. Get Recent Found Items (GET /items/found)
   */
  async getFoundItems(category?: string, query?: string): Promise<any[]> {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.append('category', category);
    if (query) params.append('query', query);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<any[]>(`/items/found${queryString}`);
  },

  /**
   * 8. Get User Reports (GET /reports)
   */
  async getUserReports(): Promise<any[]> {
    return apiFetch<any[]>('/reports');
  },
};
