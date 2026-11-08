import { GAME_CONFIG } from './GameConfig';
import type { GameStatus, GameSpeed, GameStateSnapshot } from '../types/game';

export class GameStateManager {
  private status: GameStatus = 'menu';
  private health: number = GAME_CONFIG.INITIAL_HEALTH;
  private readonly maxHealth: number = GAME_CONFIG.INITIAL_HEALTH;
  private gold: number = GAME_CONFIG.INITIAL_GOLD;
  private score: number = GAME_CONFIG.INITIAL_SCORE;
  private currentWave: number = GAME_CONFIG.INITIAL_WAVE;
  private enemiesAlive: number = 0;
  private totalSpawned: number = 0;
  private gameSpeed: GameSpeed = 1;

  private listeners: Set<(snapshot: GameStateSnapshot) => void> = new Set();

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.status = 'menu';
    this.health = GAME_CONFIG.INITIAL_HEALTH;
    this.gold = GAME_CONFIG.INITIAL_GOLD;
    this.score = GAME_CONFIG.INITIAL_SCORE;
    this.currentWave = GAME_CONFIG.INITIAL_WAVE;
    this.enemiesAlive = 0;
    this.totalSpawned = 0;
    this.gameSpeed = 1;
    this.notify();
  }

  public getSnapshot(): GameStateSnapshot {
    return {
      status: this.status,
      health: this.health,
      maxHealth: this.maxHealth,
      gold: this.gold,
      score: this.score,
      currentWave: this.currentWave,
      enemiesAlive: this.enemiesAlive,
      totalSpawned: this.totalSpawned,
      gameSpeed: this.gameSpeed,
      isPaused: this.status === 'paused',
    };
  }

  public subscribe(listener: (snapshot: GameStateSnapshot) => void): () => void {
    this.listeners.add(listener);
    // Send immediate snapshot upon subscription
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public notify(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  public setStatus(newStatus: GameStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.notify();
    }
  }

  public getStatus(): GameStatus {
    return this.status;
  }

  public setSpeed(speed: GameSpeed): void {
    this.gameSpeed = speed;
    this.notify();
  }

  public getSpeed(): GameSpeed {
    return this.gameSpeed;
  }

  public takeBaseDamage(amount: number): boolean {
    if (this.health <= 0) return false;

    this.health = Math.max(0, this.health - amount);
    if (this.health === 0) {
      this.status = 'gameover';
    }
    this.notify();
    return this.health === 0;
  }

  public addGold(amount: number): void {
    this.gold += amount;
    this.notify();
  }

  public addScore(amount: number): void {
    this.score += amount;
    this.notify();
  }

  public setEnemiesAlive(count: number): void {
    if (this.enemiesAlive !== count) {
      this.enemiesAlive = count;
      this.notify();
    }
  }

  public incrementTotalSpawned(): void {
    this.totalSpawned += 1;
    this.notify();
  }

  public setCurrentWave(wave: number): void {
    this.currentWave = wave;
    this.notify();
  }
}
