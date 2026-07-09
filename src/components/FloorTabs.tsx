type Props = {
  floorCount: number
  currentFloor: number
  wallCounts: number[]
  onFloorChange: (floor: number) => void
}

export function FloorTabs({ floorCount, currentFloor, wallCounts, onFloorChange }: Props) {
  if (floorCount <= 1) {
    return (
      <div className="floor-tabs single">
        <span className="floor-tab active">
          План
          {wallCounts[0] > 0 && <span className="floor-badge">{wallCounts[0]}</span>}
        </span>
      </div>
    )
  }

  return (
    <div className="floor-tabs" role="tablist" aria-label="Этажи">
      {Array.from({ length: floorCount }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={currentFloor === i}
          className={`floor-tab ${currentFloor === i ? 'active' : ''}`}
          onClick={() => onFloorChange(i)}
        >
          {i + 1} этаж
          {wallCounts[i] > 0 && <span className="floor-badge">{wallCounts[i]}</span>}
        </button>
      ))}
    </div>
  )
}
