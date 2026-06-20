import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { useRef, useState } from 'react'
import { useOnlineLobbyEngine } from './useOnlineLobbyEngine'
import { DEFAULT_SKIN_ID, PLAYER_SKINS } from './types'

const bindPointer =
  (setPressed: (pressed: boolean) => void) =>
  (pressed: boolean) =>
  (): void => {
    setPressed(pressed)
  }

export default function OnlineLobby() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { setInputLeft, setInputRight, setCurrentSkinId } = useOnlineLobbyEngine(canvasRef)
  const [selectedSkinId, setSelectedSkinId] = useState(DEFAULT_SKIN_ID)

  const handleSkinSelect = (skinId: string) => {
    setSelectedSkinId(skinId)
    setCurrentSkinId(skinId)
  }

  return (
    <div className="fixed inset-0 h-[100vh] w-[100vw] overflow-hidden bg-[#0f1419]">
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        aria-label="Online lobby sandbox"
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-28 z-10 flex justify-center gap-3 px-4"
        role="group"
        aria-label="Skin selection"
      >
        {PLAYER_SKINS.map((skin) => {
          const isSelected = selectedSkinId === skin.id
          return (
            <button
              key={skin.id}
              type="button"
              className="pointer-events-auto h-10 w-10 rounded-sm transition-shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{
                backgroundColor: skin.color,
                boxShadow: isSelected
                  ? '0 0 0 2px #0f1419, 0 0 0 4px #ffffff'
                  : '0 0 0 2px rgba(255, 255, 255, 0.25)',
              }}
              aria-label={`Skin ${skin.id}`}
              aria-pressed={isSelected}
              onClick={() => handleSkinSelect(skin.id)}
            />
          )
        })}
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center gap-6 px-4 pb-8 pt-4"
        role="group"
        aria-label="Movement controls"
      >
        <VoxelButton
          type="button"
          className="pointer-events-auto min-w-[5.5rem] select-none text-lg"
          aria-label="Move left"
          onPointerDown={bindPointer(setInputLeft)(true)}
          onPointerUp={bindPointer(setInputLeft)(false)}
          onPointerLeave={bindPointer(setInputLeft)(false)}
          onPointerCancel={bindPointer(setInputLeft)(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          ←
        </VoxelButton>
        <VoxelButton
          type="button"
          className="pointer-events-auto min-w-[5.5rem] select-none text-lg"
          aria-label="Move right"
          onPointerDown={bindPointer(setInputRight)(true)}
          onPointerUp={bindPointer(setInputRight)(false)}
          onPointerLeave={bindPointer(setInputRight)(false)}
          onPointerCancel={bindPointer(setInputRight)(false)}
          onContextMenu={(e) => e.preventDefault()}
        >
          →
        </VoxelButton>
      </div>
    </div>
  )
}
