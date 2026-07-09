export const GRID_SIZE = 20

export function snap(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

export function snapPoint(x: number, y: number): [number, number] {
  return [snap(x), snap(y)]
}

export function wallLength(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1)
}

export function newId(): string {
  return crypto.randomUUID()
}
