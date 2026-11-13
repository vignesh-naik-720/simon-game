export class TurnTimer {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private remainingMs: number = 5000;
  private startTime: number = 0;
  private onTimeout: () => void;

  constructor(onTimeout: () => void) {
    this.onTimeout = onTimeout;
  }

  public start(durationMs: number = 5000): void {
    this.stop();
    this.remainingMs = durationMs;
    this.startTime = Date.now();
    this.timeoutId = setTimeout(() => {
      this.onTimeout();
    }, this.remainingMs);
  }

  public reset(): void {
    this.start(5000);
  }

  public pause(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      const elapsed = Date.now() - this.startTime;
      this.remainingMs = Math.max(0, this.remainingMs - elapsed);
    }
  }

  public resume(): void {
    if (this.remainingMs > 0 && !this.timeoutId) {
      this.start(this.remainingMs);
    }
  }

  public stop(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }
}
