import { useEffect, useState } from 'react'
import type { PlanItem } from '../types'
import { isRect, isWall } from '../types'
import { getPreset } from '../constants/presets'

type Props = {
  item: PlanItem | null
  onUpdateWall: (id: string, x1: number, y1: number, x2: number, y2: number) => void
  onUpdateRect: (
    id: string,
    patch: { width?: number; height?: number; rotation?: number },
  ) => void
}

export function PropertiesPanel({ item, onUpdateWall, onUpdateRect }: Props) {
  const [width, setWidth] = useState('')
  const [height, setHeight] = useState('')
  const [rotation, setRotation] = useState('')
  const [length, setLength] = useState('')

  useEffect(() => {
    if (!item) return
    if (isWall(item)) {
      setLength(String(Math.round(Math.hypot(item.x2 - item.x1, item.y2 - item.y1))))
    } else if (isRect(item)) {
      setWidth(String(item.width))
      setHeight(String(item.height))
      setRotation(String(item.rotation))
    }
  }, [item])

  if (!item) {
    return (
      <aside className="properties">
        <h2 className="panel-title">Свойства</h2>
        <p className="properties-empty">Выберите объект на плане</p>
      </aside>
    )
  }

  if (isWall(item)) {
    const angle = Math.round((Math.atan2(item.y2 - item.y1, item.x2 - item.x1) * 180) / Math.PI)

    const applyLength = () => {
      const len = Math.max(20, Number(length) || 0)
      const rad = Math.atan2(item.y2 - item.y1, item.x2 - item.x1)
      onUpdateWall(
        item.id,
        item.x1,
        item.y1,
        item.x1 + Math.cos(rad) * len,
        item.y1 + Math.sin(rad) * len,
      )
    }

    return (
      <aside className="properties">
        <h2 className="panel-title">Свойства</h2>
        <p className="prop-kind">Стена</p>
        <label className="field">
          <span>Длина, см</span>
          <input
            type="number"
            min={20}
            step={10}
            value={length}
            onChange={(e) => setLength(e.target.value)}
            onBlur={applyLength}
            onKeyDown={(e) => e.key === 'Enter' && applyLength()}
          />
        </label>
        <p className="prop-meta">Угол: {angle}°</p>
      </aside>
    )
  }

  const preset = getPreset(item.kind)

  const applyRect = () => {
    onUpdateRect(item.id, {
      width: Math.max(10, Number(width) || preset.width),
      height: Math.max(10, Number(height) || preset.height),
      rotation: Number(rotation) || 0,
    })
  }

  return (
    <aside className="properties">
      <h2 className="panel-title">Свойства</h2>
      <p className="prop-kind">{preset.label}</p>
      <label className="field">
        <span>Ширина, см</span>
        <input
          type="number"
          min={10}
          step={10}
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          onBlur={applyRect}
          onKeyDown={(e) => e.key === 'Enter' && applyRect()}
        />
      </label>
      <label className="field">
        <span>Длина, см</span>
        <input
          type="number"
          min={10}
          step={10}
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          onBlur={applyRect}
          onKeyDown={(e) => e.key === 'Enter' && applyRect()}
        />
      </label>
      <label className="field">
        <span>Поворот, °</span>
        <input
          type="number"
          step={15}
          value={rotation}
          onChange={(e) => setRotation(e.target.value)}
          onBlur={applyRect}
          onKeyDown={(e) => e.key === 'Enter' && applyRect()}
        />
      </label>
      <p className="prop-meta">
        По умолчанию: {preset.width} × {preset.height} см
      </p>
    </aside>
  )
}
