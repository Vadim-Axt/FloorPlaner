import type { BuildingType, Theme } from '../types'

type Props = {
  buildingType: BuildingType
  floorCount: number
  theme: Theme
  onBuildingTypeChange: (type: BuildingType) => void
  onFloorCountChange: (count: number) => void
  onThemeChange: (theme: Theme) => void
}

const MAX_FLOORS = 5

export function ProjectBar({
  buildingType,
  floorCount,
  theme,
  onBuildingTypeChange,
  onFloorCountChange,
  onThemeChange,
}: Props) {
  const isHouse = buildingType === 'house'

  return (
    <header className="project-bar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <div>
          <h1 className="brand-title">Планировщик</h1>
          <p className="brand-sub">Редактор планов квартир и домов</p>
        </div>
      </div>

      <div className="project-controls">
        <fieldset className="control-group">
          <legend>Тип</legend>
          <label className="radio-label">
            <input
              type="radio"
              name="building-type"
              checked={buildingType === 'apartment'}
              onChange={() => onBuildingTypeChange('apartment')}
            />
            Квартира
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="building-type"
              checked={buildingType === 'house'}
              onChange={() => onBuildingTypeChange('house')}
            />
            Дом
          </label>
        </fieldset>

        {isHouse && (
          <fieldset className="control-group">
            <legend>Этажей</legend>
            <div className="floor-count">
              <button
                type="button"
                className="count-btn"
                disabled={floorCount <= 1}
                onClick={() => onFloorCountChange(floorCount - 1)}
                aria-label="Меньше этажей"
              >
                −
              </button>
              <span className="count-value">{floorCount}</span>
              <button
                type="button"
                className="count-btn"
                disabled={floorCount >= MAX_FLOORS}
                onClick={() => onFloorCountChange(floorCount + 1)}
                aria-label="Больше этажей"
              >
                +
              </button>
            </div>
          </fieldset>
        )}

        <fieldset className="control-group">
          <legend>Тема</legend>
          <label className="radio-label">
            <input
              type="radio"
              name="theme"
              checked={theme === 'light'}
              onChange={() => onThemeChange('light')}
            />
            Светлая
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="theme"
              checked={theme === 'soft'}
              onChange={() => onThemeChange('soft')}
            />
            Мягкая
          </label>
        </fieldset>
      </div>
    </header>
  )
}
