export interface Point {
  x: number;
  y: number;
}

export interface PathWaypoint extends Point {
  id?: number;
}

export type GameStatus = 'menu' | 'playing' | 'paused' | 'gameover';
export type GameSpeed = 1 | 2 | 3;

export interface GameStateSnapshot {
  status: GameStatus;
  health: number;
  maxHealth: number;
  gold: number;
  score: number;
  currentWave: number;
  enemiesAlive: number;
  totalSpawned: number;
  gameSpeed: GameSpeed;
  isPaused: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  frameTimeMs: number;
  simTimeMs: number;
  renderTimeMs: number;
  activeEnemies: number;
  allocatedCapacity: number;
}

export interface GameSettings {
  showPerformance: boolean;
  showPathWaypoints: boolean;
  soundEnabled: boolean;
  volume: number;
}
