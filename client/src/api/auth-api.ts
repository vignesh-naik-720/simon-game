import { ApiClient } from './client';

export interface UserProfile {
  id: string;
  username: string;
  highestScore: number;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export class AuthApi {
  public static async register(username: string, password: string): Promise<AuthResponse> {
    const data = await ApiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    ApiClient.setToken(data.token);
    return data;
  }

  public static async login(username: string, password: string): Promise<AuthResponse> {
    const data = await ApiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    ApiClient.setToken(data.token);
    return data;
  }

  public static async getCurrentUser(): Promise<UserProfile> {
    return ApiClient.request<UserProfile>('/user/me', {
      method: 'GET',
    });
  }

  public static logout(): void {
    ApiClient.clearToken();
  }
}
