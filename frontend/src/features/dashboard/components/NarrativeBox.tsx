import { cn } from '@/lib/utils'

interface NarrativeBoxProps {
  text: string
  className?: string
  /** Titre gravé dans la tablette : pas de cadre extérieur, fusion avec l’îlot. */
  embedded?: boolean
}

/** Cartouche narratif — mode flottant (parchemin) ou intégré tablette (gravure). */
export default function NarrativeBox({ text, className, embedded = false }: NarrativeBoxProps) {
  const t = text.trim()
  if (!t) return null

  if (embedded) {
    return (
      <div
        className={cn(
          'pointer-events-none text-center text-sm font-serif font-medium leading-snug text-[#f5ecd8]/95',
          'rounded-xl border border-[#3d3428]/70 bg-[linear-gradient(165deg,rgba(42,34,24,0.92)_0%,rgba(14,11,8,0.96)_55%,rgba(18,14,10,0.98)_100%)]',
          'shadow-[inset_0_2px_14px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,200,140,0.06)]',
          'px-3 py-3',
          className
        )}
      >
        {t}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'pointer-events-none mx-auto mb-2 max-w-[min(100%-0.75rem,26rem)] px-3 py-2.5 text-center',
        'rounded-xl border border-amber-500/55 text-sm font-serif font-medium leading-snug text-[#f5ecd8]',
        'shadow-[inset_0_1px_0_rgba(255,220,160,0.12),0_6px_20px_rgba(0,0,0,0.35)]',
        className
      )}
      style={{
        backgroundImage:
          'linear-gradient(165deg, rgba(55,44,28,0.72) 0%, rgba(18,14,10,0.88) 48%, rgba(24,18,14,0.9) 100%)',
      }}
    >
      {t}
    </div>
  )
}
