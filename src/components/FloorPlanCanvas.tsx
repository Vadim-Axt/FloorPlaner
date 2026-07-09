import { useCallback, useEffect, useRef, useState } from 'react'
import { Circle, Group, Layer, Line, Stage } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { PlanItem, RectKind, Tool, WallItem } from '../types'
import { isRect, isWall } from '../types'
import { GRID_SIZE, snap, snapPoint, wallLength, newId } from '../utils/geometry'
import { PlanItemShape } from './PlanItemShape'

type Props = {
  items: PlanItem[]
  currentFloor: number
  tool: Tool
  selectedId: string | null
  stroke: string
  draftStroke: string
  handleFill: string
  onAddWall: (wall: WallItem) => void
  onPlaceRect: (kind: RectKind, x: number, y: number) => void
  onUpdateWall: (id: string, x1: number, y1: number, x2: number, y2: number, record?: boolean) => void
  onUpdateRect: (
    id: string,
    patch: { x?: number; y?: number; width?: number; height?: number; rotation?: number },
    record?: boolean,
  ) => void
  onSelectItem: (id: string | null) => void
}

type DragHandle = 'start' | 'end' | null

const MIN_WALL_LEN = GRID_SIZE
const RECT_TOOLS: RectKind[] = ['door', 'window', 'room', 'bed', 'sofa', 'table']

function isRectTool(tool: Tool): tool is RectKind {
  return RECT_TOOLS.includes(tool as RectKind)
}

export function FloorPlanCanvas({
  items,
  currentFloor,
  tool,
  selectedId,
  stroke,
  draftStroke,
  handleFill,
  onAddWall,
  onPlaceRect,
  onUpdateWall,
  onUpdateRect,
  onSelectItem,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 800, height: 600 })
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 40, y: 40 })
  const [draft, setDraft] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null)
  const [dragHandle, setDragHandle] = useState<DragHandle>(null)
  const isPanning = useRef(false)
  const lastPointer = useRef({ x: 0, y: 0 })

  const floorItems = items.filter((item) => item.floor === currentFloor)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setSize({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const toWorld = useCallback(
    (stageX: number, stageY: number): [number, number] => {
      const x = (stageX - position.x) / scale
      const y = (stageY - position.y) / scale
      return snapPoint(x, y)
    },
    [position, scale],
  )

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    if (!stage) return
    const pointer = stage.getPointerPosition()
    if (!pointer) return

    const scaleBy = 1.08
    const direction = e.evt.deltaY > 0 ? -1 : 1
    const newScale = direction > 0 ? scale * scaleBy : scale / scaleBy
    const clamped = Math.min(Math.max(newScale, 0.25), 4)
    const mousePointTo = {
      x: (pointer.x - position.x) / scale,
      y: (pointer.y - position.y) / scale,
    }
    setScale(clamped)
    setPosition({
      x: pointer.x - mousePointTo.x * clamped,
      y: pointer.y - mousePointTo.y * clamped,
    })
  }

  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return
    const clickedOnEmpty = e.target === stage

    if (tool === 'pan' || e.evt.button === 1) {
      isPanning.current = true
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
      return
    }

    const pointer = stage.getPointerPosition()
    if (!pointer) return
    const [x, y] = toWorld(pointer.x, pointer.y)

    if (tool === 'wall') {
      if (!draft) {
        setDraft({ x1: x, y1: y, x2: x, y2: y })
      } else {
        if (wallLength(draft.x1, draft.y1, x, y) >= MIN_WALL_LEN) {
          onAddWall({
            kind: 'wall',
            id: newId(),
            floor: currentFloor,
            x1: draft.x1,
            y1: draft.y1,
            x2: x,
            y2: y,
          })
        }
        setDraft(null)
      }
      return
    }

    if (isRectTool(tool)) {
      onPlaceRect(tool, x, y)
      return
    }

    if (tool === 'select' && clickedOnEmpty) {
      onSelectItem(null)
    }
  }

  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (isPanning.current) {
      const dx = e.evt.clientX - lastPointer.current.x
      const dy = e.evt.clientY - lastPointer.current.y
      lastPointer.current = { x: e.evt.clientX, y: e.evt.clientY }
      setPosition((p) => ({ x: p.x + dx, y: p.y + dy }))
      return
    }

    if (draft && tool === 'wall') {
      const stage = e.target.getStage()
      const pointer = stage?.getPointerPosition()
      if (!pointer) return
      const [x, y] = toWorld(pointer.x, pointer.y)
      setDraft((d) => (d ? { ...d, x2: x, y2: y } : null))
    }
  }

  const handleStageMouseUp = () => {
    isPanning.current = false
  }

  const handleWallHandleDrag = (wall: WallItem, handle: DragHandle) => (e: KonvaEventObject<DragEvent>) => {
    const node = e.target
    const x = snap(node.x())
    const y = snap(node.y())
    node.position({ x, y })
    if (handle === 'start') onUpdateWall(wall.id, x, y, wall.x2, wall.y2, false)
    else if (handle === 'end') onUpdateWall(wall.id, wall.x1, wall.y1, x, y, false)
  }

  const handleWallHandleDragEnd = (wall: WallItem, handle: DragHandle) => (e: KonvaEventObject<DragEvent>) => {
    const node = e.target
    const x = snap(node.x())
    const y = snap(node.y())
    if (handle === 'start') onUpdateWall(wall.id, x, y, wall.x2, wall.y2, true)
    else if (handle === 'end') onUpdateWall(wall.id, wall.x1, wall.y1, x, y, true)
  }

  const selectedWall = floorItems.find((i): i is WallItem => i.id === selectedId && isWall(i))

  const cursor =
    tool === 'pan' || isPanning.current ? 'grab' : tool === 'wall' || isRectTool(tool) ? 'crosshair' : 'default'

  return (
    <div className="canvas-wrap canvas-grid" ref={containerRef} style={{ cursor }}>
      <Stage
        width={size.width}
        height={size.height}
        onWheel={handleWheel}
        onMouseDown={handleStageMouseDown}
        onMouseMove={handleStageMouseMove}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleStageMouseUp}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
      >
        <Layer>
          {floorItems.map((item) => (
            <PlanItemShape
              key={item.id}
              item={item}
              selected={item.id === selectedId}
              draggable={tool === 'select' && item.id === selectedId && isRect(item)}
              scale={scale}
              stroke={stroke}
              onSelect={(id) => tool === 'select' && onSelectItem(id)}
              onDragMove={(id, x, y) => onUpdateRect(id, { x, y }, false)}
              onDragEnd={(id, x, y) => onUpdateRect(id, { x, y }, true)}
            />
          ))}

          {draft && (
            <Line
              points={[draft.x1, draft.y1, draft.x2, draft.y2]}
              stroke={draftStroke}
              strokeWidth={1 / scale}
              dash={[6 / scale, 4 / scale]}
              listening={false}
            />
          )}

          {tool === 'select' && selectedWall && (
            <Group key={`handles-${selectedWall.id}`}>
              <Circle
                x={selectedWall.x1}
                y={selectedWall.y1}
                radius={5 / scale}
                fill={handleFill}
                stroke={stroke}
                strokeWidth={1 / scale}
                draggable
                onDragStart={() => setDragHandle('start')}
                onDragMove={handleWallHandleDrag(selectedWall, 'start')}
                onDragEnd={(e) => {
                  handleWallHandleDragEnd(selectedWall, 'start')(e)
                  setDragHandle(null)
                }}
              />
              <Circle
                x={selectedWall.x2}
                y={selectedWall.y2}
                radius={5 / scale}
                fill={handleFill}
                stroke={stroke}
                strokeWidth={1 / scale}
                draggable
                onDragStart={() => setDragHandle('end')}
                onDragMove={handleWallHandleDrag(selectedWall, 'end')}
                onDragEnd={(e) => {
                  handleWallHandleDragEnd(selectedWall, 'end')(e)
                  setDragHandle(null)
                }}
              />
            </Group>
          )}
        </Layer>
      </Stage>

      <div className="canvas-status">
        <span>Масштаб {Math.round(scale * 100)}%</span>
        <span>Сетка {GRID_SIZE} см</span>
        {draft && <span>Кликните вторую точку</span>}
        {dragHandle && <span>Перетаскивание узла</span>}
      </div>
    </div>
  )
}
