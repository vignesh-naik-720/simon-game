import { ApiClient } from './client';

export interface RecordScorePayload {
  score: number;
  roundsCompleted: number;
  durationSeconds: number;
  playedAt: string;
}

export interface RecordScoreResponse {
  scoreId: string;
  isNewHighest: boolean;
  highestScore: number;
}

export class ScoresApi {
  public static async recordScore(payload: RecordScorePayload): Promise<RecordScoreResponse> {
    try {
      return await ApiClient.request<RecordScoreResponse>('/scores', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      // Offline fallback: cache in local storage queue if API call fails
      this.cacheOfflineScore(payload);
      throw err;
    }
  }

  private static cacheOfflineScore(payload: RecordScorePayload): void {
    try {
      const cachedRaw = localStorage.getItem('simon_offline_scores') || '[]';
      const list = JSON.parse(cachedRaw);
      list.push(payload);
      localStorage.setItem('simon_offline_scores', JSON.stringify(list));
    } catch {
      // Storage unavailable
    }
  }
}
