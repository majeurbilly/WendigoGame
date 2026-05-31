import { Outlet } from 'react-router-dom'

/**
 * Layout pour /login (le panorama est géré globalement dans `App.tsx`).
 */
const AuthLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="relative z-10 mx-auto flex min-h-screen w-full items-center justify-center px-4 py-10">
        <div className="relative z-10 mx-auto w-full max-w-sm rounded-3xl border-x-2 border-b-8 border-t-4 border-[#2d261f] bg-[#1a1612] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <h1 className="mb-6 text-center text-5xl font-black uppercase tracking-widest text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
            WENDIGO
          </h1>
          <p className="mb-6 border-b border-[#2d261f] pb-6 text-center font-medium text-amber-200/60">
            Connexion
          </p>
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
