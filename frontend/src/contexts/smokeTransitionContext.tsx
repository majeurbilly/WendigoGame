import { createContext, useContext } from 'react'

export type SmokeTransitionContextValue = {
  isTransitioning: boolean
  transitionTo: (to: string) => void
  /** Même animation fumée que le menu, sans navigation (callback au pic ~400 ms). */
  playSmokeOverlay: (onMidSmoke?: () => void) => void
}

export const SmokeTransitionContext = createContext<SmokeTransitionContextValue | null>(null)

export const useSmokeTransition = (): SmokeTransitionContextValue => {
  const value = useContext(SmokeTransitionContext)
  if (!value) {
    throw new Error('useSmokeTransition must be used within SmokeTransitionContext.Provider')
  }
  return value
}
