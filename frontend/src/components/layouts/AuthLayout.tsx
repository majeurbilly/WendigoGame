import { Outlet } from 'react-router-dom'
import LobbyPanorama from '@/components/lobby/LobbyPanorama'

/**
 * Layout persistant pour /login et /register : le panorama ne se remonte pas au changement de route.
 */
const AuthLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <LobbyPanorama fillParent />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
