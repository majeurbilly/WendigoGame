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
          'pointer-events-none border-b border-[#2d261f] px-2 pb-3 pt-0.5 text-center text-sm font-serif font-medium leading-snug text-[#f5ecd8]/95',
          'bg-[#141210]/55',
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
