import { GAME_CONFIG } from '../engine/GameConfig';

export interface EnemyDefinition {
  typeId: number;
  name: string;
  speed: number;
  health: number;
  radius: number;
  goldReward: number;
  scoreReward: number;
  damage: number;
  tintColor: number;
}

export const ENEMY_TYPES: Record<string, EnemyDefinition> = {
  GOBLIN: {
    typeId: GAME_CONFIG.GOBLIN.TYPE_ID,
    name: GAME_CONFIG.GOBLIN.NAME,
    speed: GAME_CONFIG.GOBLIN.BASE_SPEED,
    health: GAME_CONFIG.GOBLIN.BASE_HEALTH,
    radius: GAME_CONFIG.GOBLIN.RADIUS,
    goldReward: GAME_CONFIG.GOBLIN.GOLD_REWARD,
    scoreReward: GAME_CONFIG.GOBLIN.SCORE_REWARD,
    damage: GAME_CONFIG.GOBLIN.BASE_DAMAGE,
    tintColor: 0x48bb78,
  },
};
