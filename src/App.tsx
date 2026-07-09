import { useCallback, useEffect, useMemo, useState } from 'react'
import { ITEM_PRESETS } from './constants/presets'
import { ActionBar } from './components/ActionBar'
import { BufferPreview } from './components/BufferPreview'
import { FloorPlanCanvas } from './components/FloorPlanCanvas'
import { FloorTabs } from './components/FloorTabs'
import { ProjectBar } from './components/ProjectBar'
import { PropertiesPanel } from './components/PropertiesPanel'
import { Toolbar } from './components/Toolbar'
import { useFloorPlan } from './hooks/useFloorPlan'
import { useTheme } from './hooks/useTheme'
import type { Tool } from './types'

function App() {
  const { theme, setTheme } = useTheme()
  const [bufferOpen, setBufferOpen] = useState(false)
  const {
    doc,
    ui,
    clipboard,
    canUndo,
    canRedo,
    undo,
    redo,
    setBuildingType,
    setFloorCount,
    setCurrentFloor,
    setTool,
    selectItem,
    addWall,
    placeRect,
    updateWall,
    updateRect,
    deleteItem,
    clearFloor,
    copySelection,
    pasteFromClipboard,
    saveToFile,
    loadFromFile,
  } = useFloorPlan()

  const itemCounts = useMemo(() => {
    return Array.from({ length: doc.floorCount }, (_, floor) =>
      doc.items.filter((item) => item.floor === floor).length,
    )
  }, [doc.items, doc.floorCount])

  const selectedItem = doc.items.find((item) => item.id === ui.selectedId) ?? null

  const handleDeleteSelected = useCallback(() => {
    if (ui.selectedId) deleteItem(ui.selectedId)
  }, [ui.selectedId, deleteItem])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      const mod = e.ctrlKey || e.metaKey

      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if (mod && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }
      if (mod && e.key === 's') {
        e.preventDefault()
        saveToFile()
        return
      }
      if (mod && e.key === 'c') {
        e.preventDefault()
        copySelection()
        return
      }
      if (mod && e.key === 'v') {
        e.preventDefault()
        pasteFromClipboard()
        return
      }

      const toolMap: Record<string, Tool> = {
        '1': 'wall',
        '2': 'select',
        '3': 'pan',
      }
      ITEM_PRESETS.forEach((p) => {
        toolMap[p.shortcut] = p.kind
      })

      if (toolMap[e.key]) {
        setTool(toolMap[e.key])
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected()
      }

      if (e.key === 'Escape') {
        selectItem(null)
        setBufferOpen(false)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    undo,
    redo,
    saveToFile,
    copySelection,
    pasteFromClipboard,
    setTool,
    handleDeleteSelected,
    selectItem,
  ])

  const canvasStroke = theme === 'light' ? '#1a1a1a' : '#2d2a26'
  const canvasDraft = theme === 'light' ? '#6b6b6b' : '#8a857c'
  const handleFill = theme === 'light' ? '#ffffff' : '#faf8f5'

  return (
    <div className="app">
      <ProjectBar
        buildingType={doc.buildingType}
        floorCount={doc.floorCount}
        theme={theme}
        onBuildingTypeChange={setBuildingType}
        onFloorCountChange={setFloorCount}
        onThemeChange={setTheme}
      />

      <ActionBar
        canUndo={canUndo}
        canRedo={canRedo}
        clipboard={clipboard}
        onUndo={undo}
        onRedo={redo}
        onSave={saveToFile}
        onLoad={loadFromFile}
        onCopy={copySelection}
        onPaste={pasteFromClipboard}
        onShowBuffer={() => setBufferOpen(true)}
      />

      <div className="workspace">
        <Toolbar
          tool={ui.tool}
          onToolChange={setTool}
          onClearFloor={clearFloor}
          hasSelection={!!ui.selectedId}
          onDeleteSelected={handleDeleteSelected}
        />

        <main className="editor">
          <FloorTabs
            floorCount={doc.floorCount}
            currentFloor={ui.currentFloor}
            wallCounts={itemCounts}
            onFloorChange={setCurrentFloor}
          />
          <FloorPlanCanvas
            items={doc.items}
            currentFloor={ui.currentFloor}
            tool={ui.tool}
            selectedId={ui.selectedId}
            stroke={canvasStroke}
            draftStroke={canvasDraft}
            handleFill={handleFill}
            onAddWall={addWall}
            onPlaceRect={placeRect}
            onUpdateWall={updateWall}
            onUpdateRect={updateRect}
            onSelectItem={selectItem}
          />
        </main>

        <PropertiesPanel
          item={selectedItem}
          onUpdateWall={updateWall}
          onUpdateRect={updateRect}
        />
      </div>

      <BufferPreview
        open={bufferOpen}
        clipboard={clipboard}
        onClose={() => setBufferOpen(false)}
        onPaste={pasteFromClipboard}
      />
    </div>
  )
}

export default App
