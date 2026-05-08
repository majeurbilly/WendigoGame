import { cn } from '@/lib/utils'

export type SmokeTransitionProps = {
  isActive: boolean
  className?: string
}

export default function SmokeTransition({ isActive, className }: SmokeTransitionProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-0 z-50 bg-slate-950',
        'opacity-0 transition-opacity duration-500',
        isActive && 'opacity-100',
        className
      )}
      aria-hidden
    />
  )
}

