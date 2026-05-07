import type { LobbyState } from '@/api/game'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'
import { useNavigate } from 'react-router-dom'

interface EndedScreenProps {
  lobby: LobbyState
  sendMessage: (type: string, payload: unknown) => boolean
}

const EndedScreen = ({ lobby, sendMessage }: EndedScreenProps) => {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const currentPlayer = lobby.players.find((player) => player.id === user?.id) ?? null

  const winnerTeam = (lobby.winnerTeam ?? '').toUpperCase()
  const isVillageWin = winnerTeam === 'VILLAGER'
  const title = isVillageWin ? 'VICTOIRE DU VILLAGE' : 'VICTOIRE DES WENDIGOS'
  const titleClasses = isVillageWin ? 'text-sky-200' : 'text-rose-300'
  const glowClasses = isVillageWin ? 'shadow-sky-500/20' : 'shadow-rose-500/20'

  const handleQuitLobby = () => {
    useGameStore.getState().resetGame()
    navigate('/')
  }

  const handleRestart = () => {
    sendMessage('RESTART_GAME', {})
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
      <Card className={`border-slate-700 bg-slate-950/80 text-center shadow-xl ${glowClasses}`}>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Final Verdict</p>
          <CardTitle className={`text-3xl font-extrabold tracking-wide md:text-5xl ${titleClasses}`}>
            {title}
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="border-slate-800 bg-slate-900/70 text-slate-100">
        <CardHeader>
          <CardTitle>Post-game Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {lobby.players.map((player) => (
              <Card key={player.id} className="border-slate-700 bg-slate-950/60 text-slate-100">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span>{player.name}</span>
                    {player.isHost ? (
                      <Badge variant="outline" className="border-amber-400/40 text-amber-200">
                        Host
                      </Badge>
                    ) : null}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge
                    className={
                      player.role?.toUpperCase() === 'WENDIGO'
                        ? 'bg-rose-500/20 text-rose-200'
                        : player.role?.toUpperCase() === 'SEER'
                          ? 'bg-sky-500/20 text-sky-200'
                          : 'bg-slate-500/20 text-slate-200'
                    }
                  >
                    {(player.role ?? 'UNKNOWN').toUpperCase()}
                  </Badge>
                  <p className={`text-sm ${player.isAlive ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {player.isAlive ? 'Survived' : 'Fell during the hunt'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {currentPlayer?.isHost ? (
            <Button type="button" size="lg" onClick={handleRestart}>
              Relancer la partie (Même groupe)
            </Button>
          ) : null}
          <Button type="button" size="lg" variant="secondary" onClick={handleQuitLobby}>
            Quitter le lobby
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EndedScreen
