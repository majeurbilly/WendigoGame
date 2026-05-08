import { Outlet } from 'react-router-dom'

/**
 * Layout pour /login et /register (le panorama est géré globalement dans `App.tsx`).
 */
const AuthLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
