import { useCallback, useEffect, useState } from 'react'
import type { Theme } from '../types'

const STORAGE_KEY = 'floorplan-theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved === 'soft' ? 'soft' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setThemeState((t) => (t === 'light' ? 'soft' : 'light'))
  }, [])

  return { theme, setTheme, toggleTheme }
}
