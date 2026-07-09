import { useCallback, useState } from 'react'
import { getPreset } from '../constants/presets'
import type {
  BuildingType,
  ClipboardData,
  DocumentAction,
  DocumentState,
  PlanItem,
  RectKind,
  Tool,
  WallItem,
} from '../types'
import { documentReducer, initialDocument } from '../utils/documentReducer'
import { newId, snap } from '../utils/geometry'
import { useHistory } from './useHistory'

const CLIPBOARD_KEY = 'floorplan-clipboard'
const SAVE_KEY = 'floorplan-autosave'

function cloneItems(items: PlanItem[]): PlanItem[] {
  return items.map((item) => ({ ...item }))
}

function offsetItems(items: PlanItem[], floor: number, dx: number, dy: number): PlanItem[] {
  return items.map((item) => {
    if (item.kind === 'wall') {
      return {
        ...item,
        id: newId(),
        floor,
        x1: snap(item.x1 + dx),
        y1: snap(item.y1 + dy),
        x2: snap(item.x2 + dx),
        y2: snap(item.y2 + dy),
      }
    }
    return {
      ...item,
      id: newId(),
      floor,
      x: snap(item.x + dx),
      y: snap(item.y + dy),
    }
  })
}

export function useFloorPlan() {
  const history = useHistory(initialDocument)
  const [ui, setUi] = useState({
    currentFloor: 0,
    selectedId: null as string | null,
    tool: 'wall' as Tool,
  })
  const [clipboard, setClipboard] = useState<ClipboardData | null>(() => {
    try {
      const raw = localStorage.getItem(CLIPBOARD_KEY)
      return raw ? (JSON.parse(raw) as ClipboardData) : null
    } catch {
      return null
    }
  })

  const doc = history.present

  const applyDoc = useCallback(
    (action: DocumentAction, record = true) => {
      const next = documentReducer(history.present, action)
      if (next === history.present) return
      if (record) history.commit(next)
      else history.replace(next)
    },
    [history],
  )

  const setBuildingType = useCallback(
    (buildingType: BuildingType) => {
      applyDoc({ type: 'SET_BUILDING_TYPE', buildingType })
      setUi((u) => ({ ...u, currentFloor: 0, selectedId: null }))
    },
    [applyDoc],
  )

  const setFloorCount = useCallback(
    (floorCount: number) => {
      applyDoc({ type: 'SET_FLOOR_COUNT', floorCount })
      setUi((u) => ({
        ...u,
        currentFloor: Math.min(u.currentFloor, floorCount - 1),
        selectedId: null,
      }))
    },
    [applyDoc],
  )

  const setCurrentFloor = useCallback((floor: number) => {
    setUi((u) => ({ ...u, currentFloor: floor, selectedId: null }))
  }, [])

  const setTool = useCallback((tool: Tool) => {
    setUi((u) => ({ ...u, tool, selectedId: tool === 'wall' || tool === 'select' ? u.selectedId : null }))
  }, [])

  const selectItem = useCallback((id: string | null) => {
    setUi((u) => ({ ...u, selectedId: id }))
  }, [])

  const addWall = useCallback(
    (wall: WallItem) => {
      applyDoc({ type: 'ADD_ITEM', item: wall })
      setUi((u) => ({ ...u, selectedId: wall.id }))
    },
    [applyDoc],
  )

  const placeRect = useCallback(
    (kind: RectKind, x: number, y: number) => {
      const preset = getPreset(kind)
      const item: PlanItem = {
        kind,
        id: newId(),
        floor: ui.currentFloor,
        x: snap(x),
        y: snap(y),
        width: preset.width,
        height: preset.height,
        rotation: 0,
      }
      applyDoc({ type: 'ADD_ITEM', item })
      setUi((u) => ({ ...u, selectedId: item.id, tool: 'select' }))
    },
    [applyDoc, ui.currentFloor],
  )

  const updateWall = useCallback(
    (id: string, x1: number, y1: number, x2: number, y2: number, record = true) => {
      applyDoc({ type: 'UPDATE_WALL', id, x1, y1, x2, y2 }, record)
    },
    [applyDoc],
  )

  const updateRect = useCallback(
    (
      id: string,
      patch: { x?: number; y?: number; width?: number; height?: number; rotation?: number },
      record = true,
    ) => {
      applyDoc({ type: 'UPDATE_RECT', id, ...patch }, record)
    },
    [applyDoc],
  )

  const deleteItem = useCallback(
    (id: string) => {
      applyDoc({ type: 'DELETE_ITEM', id })
      setUi((u) => ({ ...u, selectedId: u.selectedId === id ? null : u.selectedId }))
    },
    [applyDoc],
  )

  const clearFloor = useCallback(() => {
    applyDoc({ type: 'CLEAR_FLOOR', floor: ui.currentFloor })
    setUi((u) => ({ ...u, selectedId: null }))
  }, [applyDoc, ui.currentFloor])

  const copySelection = useCallback(() => {
    const selected = doc.items.filter((item) => item.id === ui.selectedId)
    const items = selected.length > 0 ? cloneItems(selected) : cloneItems(doc.items.filter((i) => i.floor === ui.currentFloor))

    if (items.length === 0) return

    const data: ClipboardData = {
      items,
      sourceFloor: ui.currentFloor,
      copiedAt: new Date().toISOString(),
    }
    setClipboard(data)
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(data))
  }, [doc.items, ui.selectedId, ui.currentFloor])

  const pasteFromClipboard = useCallback(() => {
    if (!clipboard || clipboard.items.length === 0) return
    const pasted = offsetItems(clipboard.items, ui.currentFloor, 40, 40)
    applyDoc({ type: 'PASTE_ITEMS', items: pasted })
    setUi((u) => ({ ...u, selectedId: pasted[pasted.length - 1]?.id ?? null }))
  }, [clipboard, applyDoc, ui.currentFloor])

  const saveToFile = useCallback(() => {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      document: doc,
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload))
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plan-${doc.buildingType}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [doc])

  const loadFromFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string) as { document: DocumentState }
          if (!parsed.document?.items) return
          history.reset(parsed.document)
          setUi({ currentFloor: 0, selectedId: null, tool: 'select' })
        } catch {
          /* ignore invalid file */
        }
      }
      reader.readAsText(file)
    },
    [history],
  )

  return {
    doc,
    ui,
    clipboard,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    undo: history.undo,
    redo: history.redo,
    setBuildingType,
    setFloorCount,
    setCurrentFloor,
    setTool,
    selectItem,
    addWall,
    placeRect,
    updateWall,
    updateRect,
    deleteItem,
    clearFloor,
    copySelection,
    pasteFromClipboard,
    saveToFile,
    loadFromFile,
  }
}
