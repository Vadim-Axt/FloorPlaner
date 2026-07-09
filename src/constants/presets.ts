import type { RectKind } from '../types'

export type ItemPreset = {
  kind: RectKind
  label: string
  hint: string
  width: number
  height: number
  shortcut: string
}

/** Размеры в сантиметрах (1 единица холста = 1 см, сетка 20 см). */
export const ITEM_PRESETS: ItemPreset[] = [
  { kind: 'door', label: 'Дверь', hint: 'Клик — разместить на плане', width: 90, height: 15, shortcut: '4' },
  { kind: 'window', label: 'Окно', hint: 'Клик — разместить на плане', width: 120, height: 15, shortcut: '5' },
  { kind: 'room', label: 'Комната', hint: 'Прямоугольник помещения', width: 360, height: 300, shortcut: '6' },
  { kind: 'bed', label: 'Кровать', hint: 'Клик — разместить', width: 160, height: 200, shortcut: '7' },
  { kind: 'sofa', label: 'Диван', hint: 'Клик — разместить', width: 220, height: 90, shortcut: '8' },
  { kind: 'table', label: 'Стол', hint: 'Клик — разместить', width: 120, height: 80, shortcut: '9' },
]

export function getPreset(kind: RectKind): ItemPreset {
  return ITEM_PRESETS.find((p) => p.kind === kind) ?? ITEM_PRESETS[0]
}
