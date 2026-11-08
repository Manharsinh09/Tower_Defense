import { EnemyStorage } from '../entities/EnemyStorage';
import { PathSystem } from './PathSystem';
import { ENEMY_TYPES } from '../entities/EnemyTypes';

export class EnemySystem {
  private storage: EnemyStorage;
  private pathSystem: PathSystem;
  public onBaseArrival: ((damage: number, slot: number) => void) | null = null;

  constructor(storage: EnemyStorage, pathSystem: PathSystem) {
    this.storage = storage;
    this.pathSystem = pathSystem;
  }

  public getStorage(): EnemyStorage {
    return this.storage;
  }

  public getPathSystem(): PathSystem {
    return this.pathSystem;
  }

  /**
   * Spawns a goblin at the start of the path.
   */
  public spawnGoblin(): number {
    const goblinDef = ENEMY_TYPES.GOBLIN;
    const spawnPoint = this.pathSystem.getSpawnPoint();

    // Start pointing towards waypoint 1
    const slot = this.storage.allocate(
      goblinDef.typeId,
      spawnPoint.x,
      spawnPoint.y,
      goblinDef.speed,
      goblinDef.health,
      1 // target waypoint index is 1 (index 0 is spawn point)
    );

    return slot;
  }

  /**
   * Fixed-timestep update for all active enemies.
   */
  public update(dt: number): void {
    const { active, posX, posY, prevPosX, prevPosY, speeds, waypointIndices, distanceTraveled, animTimes, capacity } =
      this.storage;

    for (let slot = 0; slot < capacity; slot++) {
      if (active[slot] === 0) continue;

      // Save previous position for render interpolation
      prevPosX[slot] = posX[slot];
      prevPosY[slot] = posY[slot];

      const speed = speeds[slot];
      const stepDistance = speed * dt;
      distanceTraveled[slot] += stepDistance;
      animTimes[slot] += dt * 6.5;

      const wpIndex = waypointIndices[slot];
      const currentX = posX[slot];
      const currentY = posY[slot];

      const res = this.pathSystem.advance(wpIndex, currentX, currentY, stepDistance);

      if (res.reachedEnd) {
        // Enemy reached the castle base!
        if (this.onBaseArrival) {
          this.onBaseArrival(1, slot);
        }
        this.storage.free(slot);
      } else {
        posX[slot] = res.x;
        posY[slot] = res.y;
        waypointIndices[slot] = res.waypointIndex;
      }
    }
  }

  public getActiveCount(): number {
    return this.storage.activeCount;
  }

  public clear(): void {
    this.storage.clear();
  }
}
