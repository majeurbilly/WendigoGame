import type { LobbyState, Player } from '@/api/game'
import { Trans, t } from '@/lib/lingui'
import { cn } from '@/lib/utils'
import { safeTrim } from '@/lib/safeTrim'
import { toast } from 'sonner'

type SocketActionType = 'CLAIM_SEAT'

interface ClaimSeatPayload {
  chair_id: number
}

interface ChairPickerProps {
  lobby: LobbyState
  currentPlayer: Player
  sendMessage: (type: SocketActionType, payload: ClaimSeatPayload) => boolean
  disabled?: boolean
}

const UNSEATED = -1

const cellRing =
  'border-2 border-t-[#d4b896]/90 border-l-[#d4b896]/90 border-b-[#120a06] border-r-[#120a06] bg-gradient-to-b from-[#3d342c] to-[#1e1814] font-black text-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'

const ChairPicker = ({ lobby, currentPlayer, sendMessage, disabled = false }: ChairPickerProps) => {
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
    if (disabled || hasSeat) return
    const sent = sendMessage('CLAIM_SEAT', { chair_id: chairId })
    if (!sent) {
      toast.error(t`Connection unavailable.`)
      return
    }
    toast.success(t`Seat ${chairId + 1} requested.`)
  }

  if (numChairs === 0) {
    return (
      <p className="text-center text-xs text-amber-200/70">
        <Trans>No seats to display.</Trans>
      </p>
    )
  }

  const gridCols = numChairs <= 4 ? 'grid-cols-2' : 'grid-cols-4'

  return (
    <div
      className={cn(
        `grid w-full max-w-md justify-items-center gap-3 rounded-xl border border-amber-900/40 bg-black/35 p-3 ${gridCols}`,
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      {seats.map(({ chairId, occupant }) => {
        const isMine = occupant?.id === currentPlayer.id
        const occupied = occupant !== null
        const clickable = !disabled && !hasSeat && !occupied

        const occName = safeTrim(occupant?.name)
        const label = occupied ? (occName ? occName.charAt(0).toUpperCase() : '?') : String(chairId + 1)

        const seatTitle = occupied
          ? occName || t`Taken`
          : hasSeat
            ? t`You already have a seat`
            : t`Choose seat ${chairId + 1}`

        return (
          <button
            key={chairId}
            type="button"
            disabled={!clickable}
            onClick={() => pickChair(chairId)}
            title={seatTitle}
            className={cn(
              'flex h-16 w-16 touch-manipulation items-center justify-center rounded-full text-sm transition-transform sm:h-[4.25rem] sm:w-[4.25rem] sm:text-base',
              cellRing,
              occupied &&
                (isMine
                  ? 'ring-[3px] ring-amber-400/90 ring-offset-2 ring-offset-[#14100c]'
                  : 'cursor-not-allowed opacity-55'),
              clickable && 'active:scale-95 hover:brightness-110',
              !occupied && !clickable && 'cursor-not-allowed opacity-40'
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default ChairPicker
