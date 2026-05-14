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
  /** Pions larges façon « Tableau du Conseil » (ex. vote du conseil). */
  rowTokens?: boolean
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
  rowTokens = false,
}: PlayerAvatarGridProps) {
  const dim = rowTokens
    ? 'h-14 w-14 shrink-0 text-xl'
    : size === 'lg'
      ? 'h-[3.35rem] w-[3.35rem] shrink-0 text-sm'
      : 'h-[2.85rem] w-[2.85rem] shrink-0 text-xs'

  /** Pion / rune : relief physique ; sélection = enfoncé + lueur intérieure. */
  const cellPhysical =
    'flex shrink-0 items-center justify-center rounded-lg border-t border-x border-[#3d3428] font-black text-amber-50 bg-[#241e18] transition-all duration-200'

  const cellRaised =
    'border-b-4 border-b-[#14100c] hover:translate-y-[2px] hover:border-b-2 hover:border-b-[#14100c]'

  const cellSelected =
    'translate-y-[4px] border-b-0 ring-2 ring-inset ring-amber-500/50 bg-[#36291a] shadow-[inset_0_0_12px_rgba(245,158,11,0.15)] hover:translate-y-[4px]'

  const hasActiveSelection = selectedId.length > 0

  const renderTile = (id: string, label: string, displayName: string, title: string, opts: { isClear?: boolean; blocked?: boolean }) => {
    const isSelected = selectedId === id
    const isBlocked = opts.blocked === true
    const inactive = disabled || isBlocked
    const dimOthers = hasActiveSelection && !isSelected && !inactive

    if (rowTokens) {
      const rowShell = cn(
        'w-full touch-manipulation text-left transition-opacity duration-200 rounded-xl border-b-4 border-[#14100c] bg-[#241e18] p-4 sm:p-5 flex items-center gap-4 sm:gap-6 min-w-0',
        isSelected && 'ring-2 ring-inset ring-amber-500/55 bg-[#2a2218] shadow-[inset_0_0_16px_rgba(245,158,11,0.12)]',
        inactive && 'cursor-not-allowed opacity-45',
        dimOthers && 'opacity-45',
        !inactive && !dimOthers && 'active:opacity-95 hover:brightness-[1.03]'
      )
      const avatarRing =
        'flex shrink-0 items-center justify-center rounded-full border-2 border-t-[#c9a66b]/70 border-l-[#c9a66b]/70 border-b-[#0a0604] border-r-[#0a0604] bg-gradient-to-b from-[#3d342c] to-[#1e1814] font-black text-amber-50 ring-2 ring-inset ring-amber-500/50'

      return (
        <button
          key={id || '__clear'}
          type="button"
          disabled={inactive}
          title={title}
          onClick={() => onSelect(id)}
          className={rowShell}
        >
          <span className={cn(avatarRing, dim)}>{opts.isClear ? <span className="text-2xl leading-none">{clearLabel}</span> : label}</span>
          {!opts.isClear ? (
            <span className="min-w-0 flex-1 truncate text-xl font-bold uppercase tracking-tight text-[#e8dcc4]">{displayName}</span>
          ) : (
            <span className="min-w-0 flex-1 text-sm font-bold uppercase tracking-wide text-amber-200/85">Retirer la cible</span>
          )}
        </button>
      )
    }

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
            'inline-flex min-w-0 max-w-full origin-left items-center gap-2 rounded-lg px-1 py-0.5 transition-all duration-200 ease-out',
            !inactive && !isSelected && 'hover:[&>span:first-child]:brightness-110'
          )}
        >
          <span
            className={cn(
              cellPhysical,
              dim,
              isSelected ? cellSelected : cellRaised,
              opts.isClear && 'text-amber-200/90'
            )}
          >
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
      className={cn(
        'w-full',
        rowTokens ? 'flex flex-col gap-3' : cn('grid gap-x-3 gap-y-2.5 sm:gap-x-3.5 sm:gap-y-3', columnsClassName)
      )}
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
        <div
          className={cn(
            'flex items-center justify-center gap-2 rounded-lg border border-amber-900/40 bg-black/30 py-4 text-xs text-amber-200/80',
            !rowTokens && 'col-span-full'
          )}
        >
          <UserRound className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
          Aucun joueur éligible
        </div>
      ) : null}
    </div>
  )
}
