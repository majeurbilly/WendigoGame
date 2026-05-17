import { t } from '@/lib/lingui'
import { cn } from '@/lib/utils'
import { Eye, Scroll, Skull, Users } from 'lucide-react'
import { useCallback, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const roleAccent: Record<string, string> = {
  WENDIGO: 'text-rose-200',
  VILLAGER: 'text-[#f5ecd8]',
  SEER: 'text-sky-200',
}

const roleIconReveal = (role: string, iconClass: string) => {
  const r = role.toUpperCase()
  if (r === 'WENDIGO') return <Skull className={iconClass} strokeWidth={1.25} aria-hidden />
  if (r === 'SEER') return <Eye className={iconClass} strokeWidth={1.25} aria-hidden />
  return <Users className={iconClass} strokeWidth={1.25} aria-hidden />
}

interface SecretRoleCardProps {
  role: string | null
}

/** Carte rôle : affichage uniquement tant que l’utilisateur maintient la pression (souris ou tactile). */
export default function SecretRoleCard({ role }: SecretRoleCardProps) {
  const [peeking, setPeeking] = useState(false)
  const [entered, setEntered] = useState(false)
  const label = (role ?? 'INCONNU').toUpperCase()
  const accent = role ? roleAccent[role.toUpperCase()] ?? 'text-violet-200' : 'text-slate-200'

  const startPeek = useCallback(() => setPeeking(true), [])
  const endPeek = useCallback(() => setPeeking(false), [])

  useLayoutEffect(() => {
    if (!peeking) {
      setEntered(false)
      return
    }
    setEntered(false)
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true))
    })
    return () => cancelAnimationFrame(id)
  }, [peeking])

  const iconReveal = 'h-28 w-28 shrink-0 drop-shadow-[0_6px_24px_rgba(0,0,0,0.75)] sm:h-36 sm:w-36'

  const revealLayer =
    typeof document !== 'undefined' && peeking
      ? createPortal(
          <div
            className={cn(
              'pointer-events-none fixed inset-y-0 right-0 z-[100] flex w-[min(100vw,26rem)] max-w-full flex-col justify-center',
              'pl-3 pr-[max(0.75rem,env(safe-area-inset-right))]',
              'transition-all duration-500 ease-out',
              entered ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            )}
            aria-hidden={false}
          >
            <div
              className={cn(
                'relative flex min-h-[min(85dvh,36rem)] w-full flex-col items-center justify-center gap-6 overflow-hidden rounded-l-3xl px-6 py-10',
                'border-l-[4px] border-l-[#e8d4a8]',
                'border-y-[3px] border-t-[#c9a66b]/90 border-b-[#0c0805]',
                'bg-gradient-to-br from-[#1e1812] via-[#16120e] to-[#0d0a08]',
                'shadow-[-16px_0_48px_rgba(0,0,0,0.75),inset_0_0_0_1px_rgba(255,215,160,0.12),inset_0_1px_0_rgba(255,240,200,0.08)]'
              )}
            >
              {/* grain / parchemin léger */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(212,175,106,0.12),transparent_55%),radial-gradient(ellipse_at_80%_90%,rgba(80,50,30,0.35),transparent_50%)]"
                aria-hidden
              />

              <span className={cn('relative z-[1] flex items-center justify-center', accent)}>
                {roleIconReveal(label, iconReveal)}
              </span>
              <span
                className={cn(
                  'relative z-[1] max-w-full text-center text-5xl font-black uppercase leading-none tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)] sm:text-6xl',
                  accent
                )}
                aria-live="polite"
              >
                {label}
              </span>
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <>
      {revealLayer}

      <div
        role="button"
        tabIndex={0}
        aria-label={t`Hold to reveal your secret role`}
        aria-pressed={peeking}
        className={cn(
          'pointer-events-auto select-none touch-manipulation',
          'flex h-[4.25rem] w-[4.25rem] flex-col items-center justify-center rounded-xl',
          'border-[3px] border-t-[#e4c995] border-l-[#e4c995] border-b-[#0f0804] border-r-[#0f0804]',
          'bg-[#1a1510]/88 shadow-[inset_0_2px_0_rgba(255,230,180,0.08),0_6px_16px_rgba(0,0,0,0.45)]',
          'transition-transform duration-150 will-change-transform',
          'active:scale-[0.92]'
        )}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId)
          startPeek()
        }}
        onPointerUp={(event) => {
          try {
            event.currentTarget.releasePointerCapture(event.pointerId)
          } catch {
            /* ignore */
          }
          endPeek()
        }}
        onPointerCancel={endPeek}
        onPointerLeave={(event) => {
          if (event.buttons === 0) endPeek()
        }}
        onKeyDown={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            startPeek()
          }
        }}
        onKeyUp={(event) => {
          if (event.key === ' ' || event.key === 'Enter') {
            event.preventDefault()
            endPeek()
          }
        }}
        onBlur={endPeek}
      >
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[10px] px-1">
          <div className="flex flex-col items-center justify-center opacity-100" aria-hidden={peeking}>
            <Scroll className="h-8 w-8 text-amber-200/95 drop-shadow" strokeWidth={1.75} aria-hidden />
          </div>
        </div>
      </div>
    </>
  )
}
