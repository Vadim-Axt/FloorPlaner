import type { ClipboardData, PlanItem } from '../types'
import { isWall } from '../types'
import { getPreset } from '../constants/presets'

export function itemLabel(item: PlanItem): string {
  if (isWall(item)) return 'Стена'
  return getPreset(item.kind).label
}

export function describeItem(item: PlanItem): string {
  if (isWall(item)) {
    const len = Math.round(Math.hypot(item.x2 - item.x1, item.y2 - item.y1))
    return `${len} см`
  }
  return `${item.width} × ${item.height} см`
}

export function summarizeClipboard(data: ClipboardData | null): string {
  if (!data || data.items.length === 0) return 'Буфер пуст'
  const counts = data.items.reduce<Record<string, number>>((acc, item) => {
    const key = itemLabel(item)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
  const parts = Object.entries(counts).map(([k, v]) => `${k}: ${v}`)
  return `${data.items.length} объект(ов) — ${parts.join(', ')}`
}

export function formatClipboardDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}
