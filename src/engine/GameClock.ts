import { GAME_CONFIG } from './GameConfig';
import type { GameSpeed } from '../types/game';

export class GameClock {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private speed: GameSpeed = 1;
  private isPaused: boolean = false;
  private totalSimulationTime: number = 0;

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.totalSimulationTime = 0;
  }

  public setSpeed(speed: GameSpeed): void {
    this.speed = speed;
  }

  public getSpeed(): GameSpeed {
    return this.speed;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (!paused) {
      // Avoid time leap when unpausing
      this.lastTime = performance.now();
    }
  }

  public getPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Advances the clock with the current frame time.
   * Returns how many fixed simulation steps should be run.
   */
  public advance(now: number): { steps: number; fixedDt: number; alpha: number; frameDelta: number } {
    if (this.lastTime === 0) {
      this.lastTime = now;
      return { steps: 0, fixedDt: GAME_CONFIG.FIXED_TIMESTEP, alpha: 0, frameDelta: 0 };
    }

    const realDelta = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Guard against crazy stalls (e.g. background tab or debugger pause)
    const clampedRealDelta = Math.min(realDelta, GAME_CONFIG.MAX_ACCUMULATOR);

    if (this.isPaused) {
      return { steps: 0, fixedDt: GAME_CONFIG.FIXED_TIMESTEP, alpha: 0, frameDelta: clampedRealDelta };
    }

    // Multiply delta by simulation speed
    const simDelta = clampedRealDelta * this.speed;
    this.accumulator += simDelta;

    // Safety clamp on accumulator
    if (this.accumulator > GAME_CONFIG.MAX_ACCUMULATOR) {
      this.accumulator = GAME_CONFIG.MAX_ACCUMULATOR;
    }

    const fixedDt = GAME_CONFIG.FIXED_TIMESTEP;
    let steps = Math.floor(this.accumulator / fixedDt);

    // Limit maximum catch-up steps to preserve performance
    if (steps > GAME_CONFIG.MAX_CATCHUP_STEPS) {
      steps = GAME_CONFIG.MAX_CATCHUP_STEPS;
      this.accumulator = 0; // Drop leftover to prevent lag spiral
    } else {
      this.accumulator -= steps * fixedDt;
    }

    this.totalSimulationTime += steps * fixedDt;

    // Interpolation factor between previous state and current state
    const alpha = Math.min(1, Math.max(0, this.accumulator / fixedDt));

    return { steps, fixedDt, alpha, frameDelta: clampedRealDelta };
  }

  public getTotalSimulationTime(): number {
    return this.totalSimulationTime;
  }
}
