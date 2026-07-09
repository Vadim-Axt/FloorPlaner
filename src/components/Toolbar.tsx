import { ITEM_PRESETS } from '../constants/presets'
import type { Tool } from '../types'

type Props = {
  tool: Tool
  onToolChange: (tool: Tool) => void
  onClearFloor: () => void
  hasSelection: boolean
  onDeleteSelected: () => void
}

const baseTools: { id: Tool; label: string; hint: string; shortcut: string }[] = [
  { id: 'wall', label: 'Стена', hint: 'Два клика — начало и конец', shortcut: '1' },
  { id: 'select', label: 'Выбор', hint: 'Выделение и перемещение', shortcut: '2' },
  { id: 'pan', label: 'Рука', hint: 'Перемещение холста', shortcut: '3' },
]

export function Toolbar({ tool, onToolChange, onClearFloor, hasSelection, onDeleteSelected }: Props) {
  const activePreset = ITEM_PRESETS.find((p) => p.kind === tool)
  const activeBase = baseTools.find((t) => t.id === tool)

  return (
    <aside className="toolbar">
      <h2 className="panel-title">Инструменты</h2>
      <div className="tool-group">
        {baseTools.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tool-btn ${tool === t.id ? 'active' : ''}`}
            onClick={() => onToolChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <h2 className="panel-title">Объекты</h2>
      <div className="tool-group objects">
        {ITEM_PRESETS.map((p) => (
          <button
            key={p.kind}
            type="button"
            className={`tool-btn ${tool === p.kind ? 'active' : ''}`}
            onClick={() => onToolChange(p.kind)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {(activeBase || activePreset) && (
        <p className="tool-hint">{activeBase?.hint ?? activePreset?.hint}</p>
      )}

      <div className="toolbar-actions">
        <button
          type="button"
          className="action-btn"
          disabled={!hasSelection}
          onClick={onDeleteSelected}
        >
          Удалить
        </button>
        <button type="button" className="action-btn danger" onClick={onClearFloor}>
          Очистить этаж
        </button>
      </div>

      <div className="shortcuts">
        <p className="shortcuts-title">Горячие клавиши</p>
        <ul>
          <li><kbd>1</kbd>–<kbd>3</kbd> Инструменты</li>
          <li><kbd>4</kbd>–<kbd>9</kbd> Объекты</li>
          <li><kbd>Ctrl+Z</kbd> Отменить</li>
          <li><kbd>Ctrl+Y</kbd> Вернуть</li>
          <li><kbd>Del</kbd> Удалить</li>
        </ul>
      </div>
    </aside>
  )
}
