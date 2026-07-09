import type { ClipboardData } from '../types'
import { describeItem, formatClipboardDate, itemLabel } from '../utils/clipboard'

type Props = {
  open: boolean
  clipboard: ClipboardData | null
  onClose: () => void
  onPaste: () => void
}

export function BufferPreview({ open, clipboard, onClose, onPaste }: Props) {
  if (!open) return null

  const empty = !clipboard || clipboard.items.length === 0

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="buffer-title"
      >
        <header className="modal-header">
          <h2 id="buffer-title">Буфер обмена</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </header>

        {empty ? (
          <p className="modal-empty">Ничего не скопировано. Выделите объекты и нажмите «Копировать».</p>
        ) : (
          <>
            <p className="modal-meta">
              Скопировано: {formatClipboardDate(clipboard.copiedAt)} · этаж {clipboard.sourceFloor + 1}
            </p>
            <ul className="buffer-list">
              {clipboard.items.map((item) => (
                <li key={item.id}>
                  <span>{itemLabel(item)}</span>
                  <span className="buffer-dim">{describeItem(item)}</span>
                </li>
              ))}
            </ul>
          </>
        )}

        <footer className="modal-footer">
          <button type="button" className="action-btn" onClick={onClose}>
            Закрыть
          </button>
          <button
            type="button"
            className="action-btn primary"
            disabled={empty}
            onClick={() => {
              onPaste()
              onClose()
            }}
          >
            Вставить
          </button>
        </footer>
      </div>
    </div>
  )
}
