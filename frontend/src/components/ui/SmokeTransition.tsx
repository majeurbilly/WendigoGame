import { cn } from '@/lib/utils'
import styles from './SmokeTransition.module.css'

export type SmokeTransitionProps = {
  isActive: boolean
  className?: string
}

export default function SmokeTransition({ isActive, className }: SmokeTransitionProps) {
  return (
    <div
      className={cn(
        styles.root,
        isActive && styles.active,
        className
      )}
      aria-hidden
    >
      <img
        src="/assets/images/smoke-picture.png"
        id="smoke-invader"
        alt=""
        className={styles.smokeImage}
        draggable={false}
      />
    </div>
  )
}

