import { GAME_CONFIG } from '../engine/GameConfig';
import type { EnemySystem } from './EnemySystem';

export class SpawnSystem {
  private enemySystem: EnemySystem;
  private isRunning: boolean = false;
  private timer: number = 0;
  private batchDelayTimer: number = 0;
  private spawnsRemainingInBatch: number = 0;
  private currentWave: number = 0;

  public onSpawn: (() => void) | null = null;
  public onWaveStart: ((wave: number) => void) | null = null;

  constructor(enemySystem: EnemySystem) {
    this.enemySystem = enemySystem;
    this.reset();
  }

  public start(): void {
    this.isRunning = true;
    if (this.currentWave === 0) {
      this.currentWave = 1;
      this.spawnsRemainingInBatch = GAME_CONFIG.SPAWN.BATCH_COUNT;
      this.timer = GAME_CONFIG.SPAWN.INITIAL_DELAY;
      if (this.onWaveStart) {
        this.onWaveStart(this.currentWave);
      }
    }
  }

  public stop(): void {
    this.isRunning = false;
  }

  public reset(): void {
    this.isRunning = false;
    this.timer = GAME_CONFIG.SPAWN.INITIAL_DELAY;
    this.batchDelayTimer = 0;
    this.spawnsRemainingInBatch = 0;
    this.currentWave = 0;
  }

  public getCurrentWave(): number {
    return this.currentWave;
  }

  public update(dt: number): void {
    if (!this.isRunning) return;

    // Check if waiting between waves / batches
    if (this.spawnsRemainingInBatch <= 0) {
      if (this.batchDelayTimer > 0) {
        this.batchDelayTimer -= dt;
      } else {
        // Only start next wave if enemies from previous wave are either dead/reached or reasonable pacing
        this.currentWave++;
        this.spawnsRemainingInBatch = GAME_CONFIG.SPAWN.BATCH_COUNT;
        this.timer = 0.5; // Quick initial spawn of the next wave
        if (this.onWaveStart) {
          this.onWaveStart(this.currentWave);
        }
      }
      return;
    }

    // Countdown spawn interval
    this.timer -= dt;
    if (this.timer <= 0) {
      this.enemySystem.spawnGoblin();
      this.spawnsRemainingInBatch--;
      this.timer = GAME_CONFIG.SPAWN.SPAWN_INTERVAL;

      if (this.onSpawn) {
        this.onSpawn();
      }

      if (this.spawnsRemainingInBatch <= 0) {
        this.batchDelayTimer = GAME_CONFIG.SPAWN.INTER_BATCH_DELAY;
      }
    }
  }
}
