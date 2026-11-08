import { GAME_CONFIG } from '../engine/GameConfig';

/**
 * High-performance Data-Oriented Structure of Arrays (SoA) for Enemy Entities.
 * Uses TypedArrays for optimal cache locality and zero-allocation per frame.
 * Automatically doubles capacity when needed, supporting dynamic scaling without arbitrary limits.
 */
export class EnemyStorage {
  public capacity: number;
  public activeCount: number = 0;
  private nextEntityId: number = 1;

  // Structure of Arrays (SoA)
  public ids!: Int32Array;
  public active!: Uint8Array;
  public typeIds!: Uint8Array;
  public posX!: Float32Array;
  public posY!: Float32Array;
  public prevPosX!: Float32Array;
  public prevPosY!: Float32Array;
  public waypointIndices!: Int16Array;
  public distanceTraveled!: Float32Array;
  public speeds!: Float32Array;
  public health!: Float32Array;
  public maxHealth!: Float32Array;
  public animTimes!: Float32Array;

  // Free slot pool for O(1) allocation and reuse
  private freeSlots: number[] = [];

  constructor(initialCapacity: number = GAME_CONFIG.INITIAL_ENEMY_CAPACITY) {
    this.capacity = Math.max(16, initialCapacity);
    this.allocateArrays(this.capacity);
    for (let i = this.capacity - 1; i >= 0; i--) {
      this.freeSlots.push(i);
    }
  }

  private allocateArrays(size: number): void {
    this.ids = new Int32Array(size);
    this.active = new Uint8Array(size);
    this.typeIds = new Uint8Array(size);
    this.posX = new Float32Array(size);
    this.posY = new Float32Array(size);
    this.prevPosX = new Float32Array(size);
    this.prevPosY = new Float32Array(size);
    this.waypointIndices = new Int16Array(size);
    this.distanceTraveled = new Float32Array(size);
    this.speeds = new Float32Array(size);
    this.health = new Float32Array(size);
    this.maxHealth = new Float32Array(size);
    this.animTimes = new Float32Array(size);
  }

  /**
   * Dynamically expands capacity when filled, copying existing data.
   */
  public grow(targetCapacity?: number): void {
    const oldCapacity = this.capacity;
    const newCapacity = targetCapacity ?? oldCapacity * 2;

    const oldIds = this.ids;
    const oldActive = this.active;
    const oldTypeIds = this.typeIds;
    const oldPosX = this.posX;
    const oldPosY = this.posY;
    const oldPrevPosX = this.prevPosX;
    const oldPrevPosY = this.prevPosY;
    const oldWaypointIndices = this.waypointIndices;
    const oldDistanceTraveled = this.distanceTraveled;
    const oldSpeeds = this.speeds;
    const oldHealth = this.health;
    const oldMaxHealth = this.maxHealth;
    const oldAnimTimes = this.animTimes;

    this.capacity = newCapacity;
    this.allocateArrays(newCapacity);

    // Copy over existing data
    this.ids.set(oldIds);
    this.active.set(oldActive);
    this.typeIds.set(oldTypeIds);
    this.posX.set(oldPosX);
    this.posY.set(oldPosY);
    this.prevPosX.set(oldPrevPosX);
    this.prevPosY.set(oldPrevPosY);
    this.waypointIndices.set(oldWaypointIndices);
    this.distanceTraveled.set(oldDistanceTraveled);
    this.speeds.set(oldSpeeds);
    this.health.set(oldHealth);
    this.maxHealth.set(oldMaxHealth);
    this.animTimes.set(oldAnimTimes);

    // Push newly available slots onto the free slot stack
    for (let i = newCapacity - 1; i >= oldCapacity; i--) {
      this.freeSlots.push(i);
    }
  }

  /**
   * Allocates a free slot for a new enemy.
   */
  public allocate(
    typeId: number,
    startX: number,
    startY: number,
    speed: number,
    health: number,
    startWaypointIndex: number = 0
  ): number {
    if (this.freeSlots.length === 0) {
      this.grow();
    }

    const slot = this.freeSlots.pop()!;
    const id = this.nextEntityId++;

    this.ids[slot] = id;
    this.active[slot] = 1;
    this.typeIds[slot] = typeId;
    this.posX[slot] = startX;
    this.posY[slot] = startY;
    this.prevPosX[slot] = startX;
    this.prevPosY[slot] = startY;
    this.waypointIndices[slot] = startWaypointIndex;
    this.distanceTraveled[slot] = 0;
    this.speeds[slot] = speed;
    this.health[slot] = health;
    this.maxHealth[slot] = health;
    this.animTimes[slot] = Math.random() * 10; // offset animation phase

    this.activeCount++;
    return slot;
  }

  /**
   * Frees a slot for reuse.
   */
  public free(slot: number): void {
    if (slot < 0 || slot >= this.capacity || this.active[slot] === 0) {
      return;
    }

    this.active[slot] = 0;
    this.ids[slot] = 0;
    this.freeSlots.push(slot);
    this.activeCount = Math.max(0, this.activeCount - 1);
  }

  /**
   * Iterates over all active enemy slots.
   */
  public forEachActive(callback: (slot: number) => void): void {
    for (let i = 0; i < this.capacity; i++) {
      if (this.active[i] === 1) {
        callback(i);
      }
    }
  }

  /**
   * Resets all entities and restores full capacity free slots.
   */
  public clear(): void {
    this.active.fill(0);
    this.ids.fill(0);
    this.activeCount = 0;
    this.freeSlots.length = 0;
    for (let i = this.capacity - 1; i >= 0; i--) {
      this.freeSlots.push(i);
    }
  }
}
