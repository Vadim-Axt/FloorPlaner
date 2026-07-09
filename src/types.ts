export type BuildingType = 'apartment' | 'house'

export type Theme = 'light' | 'soft'

export type RectKind = 'door' | 'window' | 'room' | 'bed' | 'sofa' | 'table'

export type Tool = 'select' | 'pan' | 'wall' | RectKind

export type WallItem = {
  kind: 'wall'
  id: string
  floor: number
  x1: number
  y1: number
  x2: number
  y2: number
}

export type RectItem = {
  kind: RectKind
  id: string
  floor: number
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export type PlanItem = WallItem | RectItem

export type DocumentState = {
  buildingType: BuildingType
  floorCount: number
  items: PlanItem[]
}

export type ClipboardData = {
  items: PlanItem[]
  sourceFloor: number
  copiedAt: string
}

export type UiState = {
  currentFloor: number
  selectedId: string | null
  tool: Tool
}

export type FloorPlanSnapshot = DocumentState & UiState

export type DocumentAction =
  | { type: 'SET_BUILDING_TYPE'; buildingType: BuildingType }
  | { type: 'SET_FLOOR_COUNT'; floorCount: number }
  | { type: 'ADD_ITEM'; item: PlanItem }
  | { type: 'UPDATE_WALL'; id: string; x1: number; y1: number; x2: number; y2: number }
  | { type: 'UPDATE_RECT'; id: string; x?: number; y?: number; width?: number; height?: number; rotation?: number }
  | { type: 'DELETE_ITEM'; id: string }
  | { type: 'CLEAR_FLOOR'; floor: number }
  | { type: 'PASTE_ITEMS'; items: PlanItem[] }
  | { type: 'LOAD_DOCUMENT'; document: DocumentState }

export function isWall(item: PlanItem): item is WallItem {
  return item.kind === 'wall'
}

export function isRect(item: PlanItem): item is RectItem {
  return item.kind !== 'wall'
}
