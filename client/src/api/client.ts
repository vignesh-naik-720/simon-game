const TOKEN_STORAGE_KEY = 'simon_auth_token';
const API_BASE_URL = '/api';

export class ApiClient {
  public static getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch {
      return null;
    }
  }

  public static setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } catch {
      // Ignored in non-browser/restricted storage environments
    }
  }

  public static clearToken(): void {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    } catch {
      // Ignored
    }
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});
    headers.set('Content-Type', 'application/json');

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) errorMessage = errorJson.message;
        else if (errorJson.error) errorMessage = errorJson.error;
      } catch {
        // Fallback to status text
      }
      throw new Error(errorMessage);
    }

    return response.json() as Promise<T>;
  }
}
