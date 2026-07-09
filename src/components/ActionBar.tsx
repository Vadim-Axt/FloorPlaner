import { useRef } from 'react'
import type { ClipboardData } from '../types'
import { summarizeClipboard } from '../utils/clipboard'

type Props = {
  canUndo: boolean
  canRedo: boolean
  clipboard: ClipboardData | null
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onLoad: (file: File) => void
  onCopy: () => void
  onPaste: () => void
  onShowBuffer: () => void
}

export function ActionBar({
  canUndo,
  canRedo,
  clipboard,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onCopy,
  onPaste,
  onShowBuffer,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const hasClipboard = !!clipboard && clipboard.items.length > 0

  return (
    <div className="action-bar">
      <div className="action-group">
        <button type="button" className="action-chip" disabled={!canUndo} onClick={onUndo} title="Ctrl+Z">
          Отменить
        </button>
        <button type="button" className="action-chip" disabled={!canRedo} onClick={onRedo} title="Ctrl+Y">
          Вернуть
        </button>
      </div>

      <div className="action-group">
        <button type="button" className="action-chip" onClick={onSave} title="Ctrl+S">
          Сохранить
        </button>
        <button type="button" className="action-chip" onClick={() => fileRef.current?.click()}>
          Открыть
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onLoad(file)
            e.target.value = ''
          }}
        />
      </div>

      <div className="action-group">
        <button type="button" className="action-chip" onClick={onCopy} title="Ctrl+C">
          Копировать
        </button>
        <button
          type="button"
          className="action-chip"
          disabled={!hasClipboard}
          onClick={onPaste}
          title="Ctrl+V"
        >
          Вставить
        </button>
        <button type="button" className="action-chip subtle" onClick={onShowBuffer}>
          Буфер
        </button>
      </div>

      <span className="buffer-hint">{summarizeClipboard(clipboard)}</span>
    </div>
  )
}
