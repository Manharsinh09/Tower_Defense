import type { PathWaypoint } from '../types/game';

export const GAME_CONFIG = {
  // World dimensions (16:9 HD standard)
  WORLD_WIDTH: 1600,
  WORLD_HEIGHT: 900,
  ASPECT_RATIO: 16 / 9,

  // Fixed timestep simulation
  FIXED_TIMESTEP: 1 / 60, // 60 ticks per second (16.67ms)
  MAX_ACCUMULATOR: 0.2, // 200ms clamp to protect against long tab stalls
  MAX_CATCHUP_STEPS: 5,

  // Initial Player Stats
  INITIAL_HEALTH: 20,
  INITIAL_GOLD: 350,
  INITIAL_SCORE: 0,
  INITIAL_WAVE: 0,

  // Enemy defaults (Goblin)
  GOBLIN: {
    TYPE_ID: 1,
    NAME: 'Goblin Scout',
    BASE_SPEED: 95, // world units per second
    BASE_HEALTH: 60,
    RADIUS: 16,
    GOLD_REWARD: 10,
    SCORE_REWARD: 25,
    BASE_DAMAGE: 1,
  },

  // Initial capacity for dynamic TypedArray storage
  INITIAL_ENEMY_CAPACITY: 64,

  // Spawn parameters for Phase 1
  SPAWN: {
    INITIAL_DELAY: 1.5, // seconds before first spawn after starting
    SPAWN_INTERVAL: 2.2, // seconds between spawns
    BATCH_COUNT: 12, // number of enemies per wave/batch in Phase 1
    INTER_BATCH_DELAY: 4.0, // seconds delay between subsequent goblin packs
  },

  // Path Configuration
  PATH_WIDTH: 74,
  DEFAULT_WAYPOINTS: [
    { x: -30, y: 340 },
    { x: 300, y: 340 },
    { x: 300, y: 700 },
    { x: 740, y: 700 },
    { x: 740, y: 220 },
    { x: 1140, y: 220 },
    { x: 1140, y: 580 },
    { x: 1460, y: 580 },
  ] as PathWaypoint[],

  // Castle dimensions
  CASTLE: {
    X: 1470,
    Y: 580,
    WIDTH: 150,
    HEIGHT: 180,
  },

  // Spawn Portal / Camp dimensions
  SPAWN_PORTAL: {
    X: 20,
    Y: 340,
  },

  // UI update throttle (10 snapshots per second)
  UI_UPDATE_INTERVAL: 0.1,
} as const;
