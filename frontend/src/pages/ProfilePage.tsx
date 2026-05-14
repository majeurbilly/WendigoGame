import { type FormEvent, useEffect, useState } from 'react'
import { toast } from 'sonner'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { useSmokeTransition } from '@/contexts/smokeTransitionContext'
import { useAuthStore } from '@/store/useAuthStore'

const labelClass = 'mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-amber-200/60'

const inputClass =
  'mb-4 w-full rounded-xl border-2 border-[#2d261f] bg-[#241e18] px-4 py-3 font-medium text-amber-500/80 shadow-inner focus:border-amber-500/50 focus:outline-none'

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user)
  const { transitionTo } = useSmokeTransition()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')

  useEffect(() => {
    if (!user) {
      return
    }
    setUsername(user.username)
    setEmail(user.email)
    setNewPassword('')
  }, [user])

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast.message('Mise à jour du profil : bientôt disponible.')
  }

  const initial = user?.username?.trim()?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 text-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-col rounded-3xl border-x-2 border-b-8 border-t-4 border-[#2d261f] bg-[#1a1612] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="mb-8 text-center text-4xl font-black uppercase tracking-widest text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] md:text-5xl">
          Profil
        </h1>

        <div
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-b-4 border-[#14100c] bg-[#241e18] text-4xl font-bold text-white ring-2 ring-amber-500/50"
          aria-hidden
        >
          {initial}
        </div>

        {user?.username ? (
          <p className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-amber-200/70">{user.username}</p>
        ) : null}

        {user && typeof user.games_played === 'number' ? (
          <div className="mb-8 grid grid-cols-2 gap-3 border-b border-[#2d261f] pb-8 text-center text-xs uppercase tracking-wider text-amber-200/50 sm:grid-cols-3">
            <div className="rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2">
              <div className="font-black text-amber-400/90">{user.games_played}</div>
              <div>Parties</div>
            </div>
            <div className="rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2">
              <div className="font-black text-amber-400/90">{user.games_won ?? '—'}</div>
              <div>Victoires</div>
            </div>
            <div className="rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2">
              <div className="font-black text-amber-400/90">{user.games_lost ?? '—'}</div>
              <div>Défaites</div>
            </div>
            <div className="rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2">
              <div className="font-black text-amber-400/90">{user.wins_as_wendigo ?? '—'}</div>
              <div>Wendigo</div>
            </div>
            <div className="col-span-2 rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2 sm:col-span-1">
              <div className="font-black text-amber-400/90">{user.wins_as_villager ?? '—'}</div>
              <div>Village</div>
            </div>
          </div>
        ) : null}

        <form className="flex flex-col" onSubmit={handleSave}>
          <label htmlFor="profile-username" className={labelClass}>
            Pseudo
          </label>
          <input
            id="profile-username"
            name="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputClass}
          />

          <label htmlFor="profile-email" className={labelClass}>
            Email
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />

          <label htmlFor="profile-password" className={labelClass}>
            Nouveau mot de passe
          </label>
          <input
            id="profile-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={inputClass}
          />

          <VoxelButton type="submit" className="mb-4 w-full">
            Mettre à jour
          </VoxelButton>
        </form>

        <VoxelButton type="button" variant="danger" className="w-full" onClick={() => transitionTo('/')}>
          Retour au menu
        </VoxelButton>
      </div>
    </div>
  )
}

export default ProfilePage
