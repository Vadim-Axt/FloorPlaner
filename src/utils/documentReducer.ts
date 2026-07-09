import type { DocumentAction, DocumentState } from '../types'

export const initialDocument: DocumentState = {
  buildingType: 'apartment',
  floorCount: 1,
  items: [],
}

export function documentReducer(state: DocumentState, action: DocumentAction): DocumentState {
  switch (action.type) {
    case 'SET_BUILDING_TYPE': {
      const isApartment = action.buildingType === 'apartment'
      return {
        ...state,
        buildingType: action.buildingType,
        floorCount: isApartment ? 1 : Math.max(state.floorCount, 1),
      }
    }
    case 'SET_FLOOR_COUNT':
      return { ...state, floorCount: action.floorCount }
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] }
    case 'UPDATE_WALL':
      return {
        ...state,
        items: state.items.map((item) =>
          item.kind === 'wall' && item.id === action.id
            ? { ...item, x1: action.x1, y1: action.y1, x2: action.x2, y2: action.y2 }
            : item,
        ),
      }
    case 'UPDATE_RECT':
      return {
        ...state,
        items: state.items.map((item) =>
          item.kind !== 'wall' && item.id === action.id
            ? {
                ...item,
                x: action.x ?? item.x,
                y: action.y ?? item.y,
                width: action.width ?? item.width,
                height: action.height ?? item.height,
                rotation: action.rotation ?? item.rotation,
              }
            : item,
        ),
      }
    case 'DELETE_ITEM':
      return { ...state, items: state.items.filter((item) => item.id !== action.id) }
    case 'CLEAR_FLOOR':
      return { ...state, items: state.items.filter((item) => item.floor !== action.floor) }
    case 'PASTE_ITEMS':
      return { ...state, items: [...state.items, ...action.items] }
    case 'LOAD_DOCUMENT':
      return { ...action.document }
    default:
      return state
  }
}
