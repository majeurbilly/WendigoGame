import { type ReactNode, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { cn } from '@/lib/utils'
import { Settings } from 'lucide-react'

export interface GameOverlayHostMenuProps {
  isPaused: boolean
  surrenderDisabled: boolean
  onTogglePause: () => void
  onStartSurrender: () => void
  onForceEnd: () => void
}

interface MainLayoutProps {
  children: ReactNode
  transparentBg?: boolean
  /** Partie en cours : barre d’app minimale flottante, zone centrale libre pour l’arrière-plan. */
  gameOverlay?: boolean
  /** Menu hôte (engrenage) — à gauche du bouton volume global (coin sup. droit). */
  gameOverlayHostMenu?: GameOverlayHostMenuProps | null
}

const MainLayout = ({ children, transparentBg, gameOverlay, gameOverlayHostMenu }: MainLayoutProps) => {
  const [hostOpen, setHostOpen] = useState(false)

  if (gameOverlay) {
    return (
      <div className={cn('min-h-screen text-slate-100', transparentBg ? 'bg-transparent' : 'bg-slate-950')}>
        {gameOverlayHostMenu ? (
          <div
            className="pointer-events-none fixed top-4 z-[9998] flex items-center sm:top-4"
            style={{
              right: 'max(5.25rem, calc(1rem + env(safe-area-inset-right) + 4.25rem))',
              marginTop: 'max(0px, env(safe-area-inset-top))',
            }}
          >
            <Popover open={hostOpen} onOpenChange={setHostOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Réglages hôte"
                  className="pointer-events-auto h-10 w-10 rounded-lg border border-[#2d261f] bg-[#1a1612] text-amber-100 shadow-lg hover:bg-[#241e18] hover:text-amber-50"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-64 space-y-2 border-amber-700/50 bg-[#1a1510]/95 p-3 text-amber-50 shadow-xl"
              >
                <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/80">Hôte</p>
                <VoxelButton type="button" className="w-full" onClick={() => { gameOverlayHostMenu.onTogglePause(); setHostOpen(false) }}>
                  {gameOverlayHostMenu.isPaused ? 'Reprendre' : 'Pause'}
                </VoxelButton>
                <VoxelButton
                  type="button"
                  variant="muted"
                  className="w-full"
                  disabled={gameOverlayHostMenu.surrenderDisabled}
                  onClick={() => {
                    if (!gameOverlayHostMenu.surrenderDisabled) {
                      gameOverlayHostMenu.onStartSurrender()
                      setHostOpen(false)
                    }
                  }}
                >
                  Abandon
                </VoxelButton>
                <VoxelButton
                  type="button"
                  variant="danger"
                  className="w-full"
                  onClick={() => {
                    gameOverlayHostMenu.onForceEnd()
                    setHostOpen(false)
                  }}
                >
                  Forcer la fin
                </VoxelButton>
              </PopoverContent>
            </Popover>
          </div>
        ) : null}

        <main className="relative min-h-screen w-full max-w-none px-0 py-0">{children}</main>
      </div>
    )
  }

  return (
    <div className={cn('min-h-screen text-slate-100', transparentBg ? 'bg-transparent' : 'bg-slate-950')}>
      <main className={cn('relative mx-auto w-full max-w-none px-0 py-0', transparentBg ? 'max-w-7xl' : 'max-w-6xl')}>
        {children}
      </main>
    </div>
  )
}

export default MainLayout
