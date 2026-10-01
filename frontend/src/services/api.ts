import {
  ItemResponse,
  MatchResponse,
  ItemMatchesListResponse,
  VerificationQuestionResponse,
  VerificationResult,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Convert backend image_path to a full HTTP URL
 */
export function getImageUrl(imagePath?: string | null): string {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }
  const backendBase = API_BASE_URL.replace(/\/api\/?$/, '');
  const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\//, '');
  return `${backendBase}/${cleanPath}`;
}

/**
 * Helper for making API requests with standard error handling
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE_URL.replace(/\/$/, '')}${cleanEndpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        errorData.error?.message ||
        errorData.detail ||
        (Array.isArray(errorData) ? errorData.map((e: any) => e.msg || e).join(', ') : null) ||
        `Server returned status ${response.status}`;
      throw new Error(message);
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
   * Multipart/form-data: image, description, category, color, brand, location, date_time
   */
  async createLostReport(formData: FormData): Promise<ItemResponse> {
    const res = await apiFetch<ItemResponse>('/items/lost', {
      method: 'POST',
      body: formData,
    });
    return {
      ...res,
      item_id: res.id || res.item_id,
    };
  },

  /**
   * 2. Create Found Report (POST /items/found)
   * Multipart/form-data: image, description, category, color, brand, location, date_time
   */
  async createFoundReport(formData: FormData): Promise<ItemResponse> {
    const res = await apiFetch<ItemResponse>('/items/found', {
      method: 'POST',
      body: formData,
    });
    return {
      ...res,
      item_id: res.id || res.item_id,
    };
  },

  /**
   * 3. Get Single Item Details (GET /items/{item_id})
   */
  async getItem(itemId: string): Promise<ItemResponse> {
    const res = await apiFetch<ItemResponse>(`/items/${itemId}`);
    return {
      ...res,
      item_id: res.id || res.item_id,
    };
  },

  /**
   * 4. Find Matches (POST /items/{item_id}/match)
   * Note: Triggers AI reasoning; called only in user workflow, not during testing.
   */
  async findMatches(itemId: string): Promise<MatchResponse> {
    return apiFetch<MatchResponse>(`/items/${itemId}/match`, {
      method: 'POST',
    });
  },

  /**
   * 5. Get Saved Matches for Item (GET /matches/{item_id})
   */
  async getMatches(itemId: string): Promise<ItemMatchesListResponse> {
    return apiFetch<ItemMatchesListResponse>(`/matches/${itemId}`);
  },

  /**
   * 6. Get Verification Question (GET /matches/{match_id}/verification-question)
   */
  async getVerificationQuestion(matchId: string): Promise<VerificationQuestionResponse> {
    return apiFetch<VerificationQuestionResponse>(`/matches/${matchId}/verification-question`);
  },

  /**
   * 7. Verify Ownership (POST /matches/{match_id}/verify)
   */
  async verifyOwnership(matchId: string, answer: string): Promise<VerificationResult> {
    const res = await apiFetch<{ verified: boolean; message: string }>(`/matches/${matchId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ answer }),
    });
    return {
      match_id: matchId,
      verified: res.verified,
      status: res.verified ? 'verified' : 'failed',
      message: res.message,
    };
  },

  /**
   * 8. Update Item Status (PATCH /items/{item_id}/status)
   */
  async updateItemStatus(itemId: string, status: string): Promise<ItemResponse> {
    return apiFetch<ItemResponse>(`/items/${itemId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
  },
};
