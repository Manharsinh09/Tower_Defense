import type { Point, PathWaypoint } from '../types/game';

export interface PathSegment {
  from: Point;
  to: Point;
  dx: number;
  dy: number;
  length: number;
  dirX: number;
  dirY: number;
  startDistance: number;
}

export class PathSystem {
  private waypoints: PathWaypoint[] = [];
  private segments: PathSegment[] = [];
  private totalLength: number = 0;

  constructor(waypoints: PathWaypoint[]) {
    this.setWaypoints(waypoints);
  }

  public setWaypoints(waypoints: PathWaypoint[]): void {
    if (waypoints.length < 2) {
      throw new Error('Path must have at least 2 waypoints');
    }

    this.waypoints = waypoints.map((wp, idx) => ({ ...wp, id: idx }));
    this.segments = [];
    this.totalLength = 0;

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const length = Math.hypot(dx, dy);
      const dirX = length > 0 ? dx / length : 0;
      const dirY = length > 0 ? dy / length : 0;

      this.segments.push({
        from,
        to,
        dx,
        dy,
        length,
        dirX,
        dirY,
        startDistance: this.totalLength,
      });

      this.totalLength += length;
    }
  }

  public getWaypoints(): PathWaypoint[] {
    return this.waypoints;
  }

  public getSegments(): PathSegment[] {
    return this.segments;
  }

  public getSpawnPoint(): Point {
    return this.waypoints[0];
  }

  public getEndPoint(): Point {
    return this.waypoints[this.waypoints.length - 1];
  }

  public getTotalLength(): number {
    return this.totalLength;
  }

  public getSegmentCount(): number {
    return this.segments.length;
  }

  /**
   * Advances an entity along the waypoints by stepDistance.
   * Returns:
   * - newX, newY: calculated coordinates
   * - newWaypointIndex: current target waypoint index
   * - reachedEnd: true if reached base / end of path
   */
  public advance(
    currentWaypointIndex: number,
    posX: number,
    posY: number,
    stepDistance: number
  ): { x: number; y: number; waypointIndex: number; reachedEnd: boolean } {
    let wpIdx = currentWaypointIndex;
    let x = posX;
    let y = posY;
    let remainingDistance = stepDistance;

    while (remainingDistance > 0) {
      if (wpIdx >= this.waypoints.length) {
        return { x: this.getEndPoint().x, y: this.getEndPoint().y, waypointIndex: wpIdx, reachedEnd: true };
      }

      const targetWp = this.waypoints[wpIdx];
      const dx = targetWp.x - x;
      const dy = targetWp.y - y;
      const distToTarget = Math.hypot(dx, dy);

      if (distToTarget <= 0.001) {
        wpIdx++;
        if (wpIdx >= this.waypoints.length) {
          return { x: targetWp.x, y: targetWp.y, waypointIndex: wpIdx, reachedEnd: true };
        }
        continue;
      }

      if (remainingDistance >= distToTarget) {
        remainingDistance -= distToTarget;
        x = targetWp.x;
        y = targetWp.y;
        wpIdx++;
        if (wpIdx >= this.waypoints.length) {
          return { x, y, waypointIndex: wpIdx, reachedEnd: true };
        }
      } else {
        const ratio = remainingDistance / distToTarget;
        x += dx * ratio;
        y += dy * ratio;
        remainingDistance = 0;
      }
    }

    return { x, y, waypointIndex: wpIdx, reachedEnd: false };
  }
}
