import { cn } from '@/lib/utils'
import { UserRound } from 'lucide-react'

export const playerInitial = (name: string): string => {
  const t = name.trim()
  if (!t) return '?'
  return t.slice(0, 1).toUpperCase()
}

export interface AvatarPlayer {
  id: string
  name: string
}

interface PlayerAvatarGridProps {
  players: AvatarPlayer[]
  selectedId: string
  onSelect: (id: string) => void
  disabled?: boolean
  /** Affiche une première case pour désélectionner (ex. intention Wendigo). */
  allowClear?: boolean
  clearLabel?: string
  idsDisabled?: ReadonlySet<string>
  selfId?: string
  columnsClassName?: string
  size?: 'md' | 'lg'
}

export default function PlayerAvatarGrid({
  players,
  selectedId,
  onSelect,
  disabled = false,
  allowClear = false,
  clearLabel = '—',
  idsDisabled,
  selfId,
  columnsClassName = 'grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3',
  size = 'md',
}: PlayerAvatarGridProps) {
  const dim =
    size === 'lg' ? 'h-[3.35rem] w-[3.35rem] shrink-0 text-sm' : 'h-[2.85rem] w-[2.85rem] shrink-0 text-xs'

  const badgeSelected =
    'ring-4 ring-amber-400/90 ring-offset-2 ring-offset-[#14100c] shadow-[0_0_15px_rgba(255,215,0,0.5)] scale-110'

  const cellBase =
    'flex shrink-0 items-center justify-center rounded-full border-2 border-t-[#c9a66b]/85 border-l-[#c9a66b]/85 border-b-[#1a0f08] border-r-[#1a0f08] ' +
    'bg-gradient-to-b from-[#3d342c] to-[#1e1814] font-black text-amber-50 transition-transform'

  const hasActiveSelection = selectedId.length > 0

  const renderTile = (id: string, label: string, displayName: string, title: string, opts: { isClear?: boolean; blocked?: boolean }) => {
    const isSelected = selectedId === id
    const isBlocked = opts.blocked === true
    const inactive = disabled || isBlocked
    const dimOthers = hasActiveSelection && !isSelected && !inactive

    return (
      <button
        key={id || '__clear'}
        type="button"
        disabled={inactive}
        title={title}
        onClick={() => onSelect(id)}
        className={cn(
          'touch-manipulation rounded-lg p-1 text-left transition-opacity duration-200',
          inactive && 'cursor-not-allowed opacity-45',
          dimOthers && 'opacity-40',
          !inactive && !dimOthers && 'active:opacity-90'
        )}
      >
        <span
          className={cn(
            'inline-flex min-w-0 max-w-full origin-left items-center gap-2 rounded-lg px-1 py-0.5 transition-transform duration-200 ease-out',
            isSelected && badgeSelected,
            !inactive && !isSelected && 'hover:brightness-110'
          )}
        >
          <span className={cn(cellBase, dim, opts.isClear && 'text-amber-200/90')}>
            {opts.isClear ? <span className="text-lg leading-none">{clearLabel}</span> : <span>{label}</span>}
          </span>
          {!opts.isClear ? (
            <span className="min-w-0 flex-1 truncate text-left text-xs font-semibold leading-snug text-[#f5ecd8] sm:text-sm">
              {displayName}
            </span>
          ) : null}
        </span>
      </button>
    )
  }

  return (
    <div
      className={cn('grid w-full gap-x-3 gap-y-2.5 sm:gap-x-3.5 sm:gap-y-3', columnsClassName)}
      role="listbox"
      aria-label="Choisir un joueur"
    >
      {allowClear
        ? renderTile('', clearLabel, '', 'Retirer la sélection', {
            isClear: true,
            blocked: false,
          })
        : null}
      {players.map((player) => {
        const blocked = idsDisabled?.has(player.id) === true
        const isSelf = selfId !== undefined && player.id === selfId
        const displayName = isSelf ? `${player.name} (vous)` : player.name
        return renderTile(player.id, playerInitial(player.name), displayName, displayName, {
          blocked,
        })
      })}
      {players.length === 0 && !allowClear ? (
        <div className="col-span-full flex items-center justify-center gap-2 rounded-lg border border-amber-900/40 bg-black/30 py-4 text-xs text-amber-200/80">
          <UserRound className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
          Aucun joueur éligible
        </div>
      ) : null}
    </div>
  )
}
