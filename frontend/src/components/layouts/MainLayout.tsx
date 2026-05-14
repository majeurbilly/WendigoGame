import { type ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import VolumeControl from '@/features/dashboard/components/VolumeControl'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
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
  /** Menu hôte (engrenage) à côté du logout — uniquement si défini. */
  gameOverlayHostMenu?: GameOverlayHostMenuProps | null
}

const MainLayout = ({ children, transparentBg, gameOverlay, gameOverlayHostMenu }: MainLayoutProps) => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const [hostOpen, setHostOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (gameOverlay) {
    return (
      <div className={cn('min-h-screen text-slate-100', transparentBg ? 'bg-transparent' : 'bg-slate-950')}>
        <div className="pointer-events-none fixed right-2 top-2 z-[60] flex items-center sm:right-3 sm:top-3">
          <div
            className="pointer-events-auto flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-[#14100c]/88 px-1.5 py-1 shadow-lg sm:gap-2 sm:px-2 sm:py-1.5"
            style={{ marginTop: 'max(0px, env(safe-area-inset-top))', marginRight: 'max(0px, env(safe-area-inset-right))' }}
          >
            <VolumeControl />
            {gameOverlayHostMenu ? (
              <Popover open={hostOpen} onOpenChange={setHostOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Réglages hôte"
                    className="h-8 w-8 border-amber-800/55 bg-black/35 text-amber-100 hover:bg-black/50 hover:text-amber-50"
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
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 border-amber-800/55 bg-black/35 px-2.5 text-xs text-amber-50 hover:bg-black/50 hover:text-amber-50"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>

        <main className="relative min-h-screen w-full max-w-none px-0 py-0">{children}</main>
      </div>
    )
  }

  return (
    <div className={cn('min-h-screen text-slate-100', transparentBg ? 'bg-transparent' : 'bg-slate-950')}>
      <header className="border-b border-slate-800 bg-slate-900/95">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold tracking-wide text-slate-100">kingDOM</h1>
          <div className="flex items-center gap-2">
            <VolumeControl />
            <Button type="button" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main
        className={cn('mx-auto w-full px-4 py-6', transparentBg ? 'max-w-7xl' : 'max-w-6xl')}
      >
        {children}
      </main>
    </div>
  )
}

export default MainLayout
