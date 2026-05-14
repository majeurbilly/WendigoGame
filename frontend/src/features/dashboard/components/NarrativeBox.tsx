import { cn } from '@/lib/utils'

interface NarrativeBoxProps {
  text: string
  className?: string
}

/** Cartouche narratif type parchemin / sceau doré — fond semi-transparent, village lisible derrière. */
export default function NarrativeBox({ text, className }: NarrativeBoxProps) {
  const t = text.trim()
  if (!t) return null

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
