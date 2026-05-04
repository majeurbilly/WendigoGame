import type { LobbyState, Player } from '@/api/game'
import { toast } from 'sonner'

const UNSEATED = -1

type SocketActionType = 'CLAIM_SEAT'

interface ClaimSeatPayload {
  chair_id: number
}

interface ChairPickerProps {
  lobby: LobbyState
  currentPlayer: Player
  sendMessage: (type: SocketActionType, payload: ClaimSeatPayload) => boolean
}

const ChairPicker = ({ lobby, currentPlayer, sendMessage }: ChairPickerProps) => {
  const hasSeat = currentPlayer.chairId >= 0 && currentPlayer.chairId !== UNSEATED
  const players = lobby.players
  const numChairs = players.length

  const seats =
    numChairs > 0
      ? Array.from({ length: numChairs }, (_, chairId) => {
          const occupant = players.find((p) => p.chairId === chairId) ?? null
          return { chairId, occupant }
        })
      : []

  const pickChair = (chairId: number) => {
    if (hasSeat) return
    const sent = sendMessage('CLAIM_SEAT', { chair_id: chairId })
    if (!sent) {
      toast.error('Connexion indisponible.')
      return
    }
    toast.success(`Chaise ${chairId + 1} demandée.`)
  }

  if (numChairs === 0) {
    return (
      <p className="text-center text-sm text-slate-500">Aucun joueur — pas de places à afficher.</p>
    )
  }

  const gridCols = numChairs <= 4 ? 'grid-cols-2' : 'grid-cols-4'

  return (
    <div
      className={`grid w-full max-w-md gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 ${gridCols}`}
    >
      {seats.map(({ chairId, occupant }) => {
        const isMine = occupant?.id === currentPlayer.id
        const occupied = occupant !== null
        const clickable = !hasSeat && !occupied

        let cellClass =
          'flex h-14 w-full items-center justify-center rounded-lg border-2 text-sm font-medium transition-colors'
        if (occupied) {
          cellClass += isMine
            ? ' border-amber-400/70 bg-amber-500/15 text-amber-100'
            : ' cursor-not-allowed border-slate-700 bg-slate-900/80 text-slate-400 opacity-70'
        } else if (clickable) {
          cellClass +=
            ' cursor-pointer border-rose-500/40 bg-rose-950/25 text-rose-100 hover:bg-rose-900/35 hover:border-rose-400/60'
        } else {
          cellClass += ' cursor-not-allowed border-slate-800 bg-slate-900/50 text-slate-500'
        }

        const label = occupied
          ? (occupant?.name?.trim()?.charAt(0)?.toUpperCase() ?? '?')
          : String(chairId + 1)

        return (
          <button
            key={chairId}
            type="button"
            disabled={!clickable}
            onClick={() => pickChair(chairId)}
            className={cellClass}
            title={
              occupied
                ? (occupant?.name ?? 'Occupée')
                : hasSeat
                  ? 'Vous avez déjà une chaise'
                  : `Choisir la place ${chairId + 1}`
            }
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default ChairPicker
