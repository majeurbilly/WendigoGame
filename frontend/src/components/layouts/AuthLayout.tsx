import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AuthLayoutProps {
  children: ReactNode
  /** Calque sous le formulaire (ex. LobbyPanorama). Sans calque, conserve le fond dégradé. */
  background?: ReactNode
}

const AuthLayout = ({ children, background }: AuthLayoutProps) => {
  const hasCustomBackground = Boolean(background)

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-hidden text-slate-100',
        !hasCustomBackground &&
          'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
      )}
    >
      {background}

      <div
        className={cn(
          'relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10'
        )}
      >
        <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
