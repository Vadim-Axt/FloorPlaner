import { useCallback, useState } from 'react'

export function useHistory<T>(initial: T) {
  const [past, setPast] = useState<T[]>([])
  const [present, setPresent] = useState(initial)
  const [future, setFuture] = useState<T[]>([])

  const commit = useCallback((next: T) => {
    setPresent((current) => {
      setPast((prev) => [...prev, current])
      return next
    })
    setFuture([])
  }, [])

  const replace = useCallback((next: T) => {
    setPresent(next)
  }, [])

  const undo = useCallback(() => {
    setPast((prev) => {
      if (prev.length === 0) return prev
      const previous = prev[prev.length - 1]
      setPresent((current) => {
        setFuture((f) => [current, ...f])
        return previous
      })
      return prev.slice(0, -1)
    })
  }, [])

  const redo = useCallback(() => {
    setFuture((prev) => {
      if (prev.length === 0) return prev
      const next = prev[0]
      setPresent((current) => {
        setPast((p) => [...p, current])
        return next
      })
      return prev.slice(1)
    })
  }, [])

  const reset = useCallback((next: T) => {
    setPast([])
    setPresent(next)
    setFuture([])
  }, [])

  return {
    present,
    commit,
    replace,
    undo,
    redo,
    reset,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  }
}
