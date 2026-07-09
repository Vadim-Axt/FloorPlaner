import { Arc, Group, Line, Rect } from 'react-konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import type { PlanItem, RectItem } from '../types'
import { isWall } from '../types'
import { snap } from '../utils/geometry'

type Props = {
  item: PlanItem
  selected: boolean
  draggable: boolean
  scale: number
  stroke: string
  onSelect: (id: string) => void
  onDragMove?: (id: string, x: number, y: number) => void
  onDragEnd?: (id: string, x: number, y: number) => void
}

function RectShape({
  item,
  selected,
  draggable,
  scale,
  stroke,
  onSelect,
  onDragMove,
  onDragEnd,
}: {
  item: RectItem
  selected: boolean
  draggable: boolean
  scale: number
  stroke: string
  onSelect: (id: string) => void
  onDragMove?: (id: string, x: number, y: number) => void
  onDragEnd?: (id: string, x: number, y: number) => void
}) {
  const sw = (selected ? 2 : 1) / scale
  const hit = 12 / scale
  const cx = item.x + item.width / 2
  const cy = item.y + item.height / 2
  const hw = item.width / 2
  const hh = item.height / 2

  const posFromCenter = (centerX: number, centerY: number) => ({
    x: snap(centerX - hw),
    y: snap(centerY - hh),
  })

  const handleDrag = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target
    const { x, y } = posFromCenter(node.x(), node.y())
    node.position({ x: x + hw, y: y + hh })
    onDragMove?.(item.id, x, y)
  }

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target
    const { x, y } = posFromCenter(node.x(), node.y())
    onDragEnd?.(item.id, x, y)
  }

  return (
    <Group
      x={cx}
      y={cy}
      rotation={item.rotation}
      draggable={draggable}
      onDragMove={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(item.id)}
      onTap={() => onSelect(item.id)}
    >
      {item.kind === 'door' && (
        <>
          <Rect x={-hw} y={-hh} width={item.width} height={item.height} stroke={stroke} strokeWidth={sw} />
          <Arc
            x={-hw}
            y={hh}
            innerRadius={0}
            outerRadius={item.width}
            angle={90}
            rotation={-90}
            stroke={stroke}
            strokeWidth={sw * 0.8}
          />
        </>
      )}

      {item.kind === 'window' && (
        <>
          <Rect x={-hw} y={-hh} width={item.width} height={item.height} stroke={stroke} strokeWidth={sw} />
          <Line points={[0, -hh, 0, hh]} stroke={stroke} strokeWidth={sw * 0.6} />
        </>
      )}

      {item.kind === 'room' && (
        <Rect
          x={-hw}
          y={-hh}
          width={item.width}
          height={item.height}
          stroke={stroke}
          strokeWidth={sw}
          dash={[8 / scale, 6 / scale]}
          cornerRadius={4 / scale}
        />
      )}

      {item.kind !== 'door' && item.kind !== 'window' && item.kind !== 'room' && (
        <Rect
          x={-hw}
          y={-hh}
          width={item.width}
          height={item.height}
          stroke={stroke}
          strokeWidth={sw}
          cornerRadius={6 / scale}
        />
      )}

      <Rect
        x={-hw}
        y={-hh}
        width={item.width}
        height={item.height}
        fill="transparent"
        hitStrokeWidth={hit}
      />
    </Group>
  )
}

export function PlanItemShape({
  item,
  selected,
  draggable,
  scale,
  stroke,
  onSelect,
  onDragMove,
  onDragEnd,
}: Props) {
  const sw = (selected ? 2 : 1) / scale
  const hit = 12 / scale

  if (isWall(item)) {
    return (
      <Line
        points={[item.x1, item.y1, item.x2, item.y2]}
        stroke={stroke}
        strokeWidth={sw}
        hitStrokeWidth={hit}
        onClick={() => onSelect(item.id)}
        onTap={() => onSelect(item.id)}
      />
    )
  }

  return (
    <RectShape
      item={item}
      selected={selected}
      draggable={draggable}
      scale={scale}
      stroke={stroke}
      onSelect={onSelect}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  )
}
