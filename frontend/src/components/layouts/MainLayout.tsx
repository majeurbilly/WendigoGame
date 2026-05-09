import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import VolumeControl from '@/features/dashboard/components/VolumeControl'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'

interface MainLayoutProps {
  children: ReactNode
  transparentBg?: boolean
}

const MainLayout = ({ children, transparentBg }: MainLayoutProps) => {
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={cn('min-h-screen text-slate-100', transparentBg ? 'bg-transparent' : 'bg-slate-950')}>
      <header className="border-b border-slate-800 bg-slate-900/95">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold tracking-wide text-slate-100">kingDOM</h1>
          <div className="flex items-center gap-2">
            <VolumeControl />
            <Button type="button" variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}

export default MainLayout
