import { ApiClient } from './client';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  highestScore: number;
  achievedAt: string;
  isCurrentUser: boolean;
}

export interface GlobalChampionInfo {
  highestScore: number;
  championUsername: string;
  achievedAt: string;
}

export interface UserScoreHistoryItem {
  id: string;
  score: number;
  roundsCompleted: number;
  durationSeconds: number;
  playedAt: string;
}

export class LeaderboardApi {
  public static async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return ApiClient.request<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`);
  }

  public static async getGlobalChampion(): Promise<GlobalChampionInfo | null> {
    try {
      return await ApiClient.request<GlobalChampionInfo>('/leaderboard/global-best');
    } catch {
      return null;
    }
  }

  public static async getMyHistory(): Promise<UserScoreHistoryItem[]> {
    return ApiClient.request<UserScoreHistoryItem[]>('/scores/my-history');
  }

  public static async deleteScore(scoreId: string): Promise<{ success: boolean; newHighestScore: number }> {
    return ApiClient.request<{ success: boolean; newHighestScore: number }>(`/scores/${scoreId}`, {
      method: 'DELETE',
    });
  }
}

