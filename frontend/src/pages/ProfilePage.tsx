import { Trans } from '@/lib/lingui'
import { useEffect, useState } from 'react'
import { useSmokeTransition } from '@/contexts/smokeTransitionContext'
import VoxelButton from '@/features/dashboard/components/game/VoxelButton'
import { safeTrim } from '@/lib/safeTrim'
import { useAuthStore } from '@/store/useAuthStore'

const labelClass = 'mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-amber-200/60'

const inputClass =
  'mb-4 w-full rounded-xl border-2 border-[#2d261f] bg-[#241e18] px-4 py-3 font-medium text-amber-500/80 shadow-inner focus:border-amber-500/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60'

const avatarShellClass =
  'mx-auto mb-6 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-b-4 border-[#14100c] bg-[#241e18] text-4xl font-bold text-white ring-2 ring-amber-500/50'

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const fetchMeProfile = useAuthStore((state) => state.fetchMeProfile)
  const { transitionTo } = useSmokeTransition()

  const [avatarError, setAvatarError] = useState(false)

  useEffect(() => {
    if (token) {
      void fetchMeProfile()
    }
  }, [token, fetchMeProfile])

  useEffect(() => {
    setAvatarError(false)
  }, [user?.picture])

  const initialChar = safeTrim(user?.username)
  const initial = initialChar ? initialChar.charAt(0).toUpperCase() : '?'
  const showGoogleAvatar = Boolean(user?.picture) && !avatarError

  return (
    <div className="relative z-10 flex min-h-screen items-center justify-center p-4 text-slate-100">
      <div className="mx-auto flex w-full max-w-xl flex-col rounded-3xl border-x-2 border-b-8 border-t-4 border-[#2d261f] bg-[#1a1612] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-h-[calc(100vh-2rem)] overflow-y-auto">
        <h1 className="mb-8 text-center text-4xl font-black uppercase tracking-widest text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)] md:text-5xl">
          <Trans>Profile</Trans>
        </h1>

        <div className={avatarShellClass} aria-hidden>
          {showGoogleAvatar ? (
            <img
              src={user!.picture}
              alt=""
              className="h-24 w-24 rounded-full object-cover"
              onError={() => setAvatarError(true)}
            />
          ) : (
            initial
          )}
        </div>

        {user?.username ? (
          <p className="mb-6 text-center text-sm font-bold uppercase tracking-widest text-amber-200/70">{user.username}</p>
        ) : null}

        {user && typeof user.games_played === 'number' ? (
          <div className="mb-8 grid grid-cols-2 gap-3 border-b border-[#2d261f] pb-8 text-center text-xs uppercase tracking-wider text-amber-200/50 sm:grid-cols-3">
            <div className="rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2">
              <div className="font-black text-amber-400/90">{user.games_played}</div>
              <div>
                <Trans>Games</Trans>
              </div>
            </div>
            <div className="rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2">
              <div className="font-black text-amber-400/90">{user.games_won ?? '—'}</div>
              <div>
                <Trans>Wins</Trans>
              </div>
            </div>
            <div className="rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2">
              <div className="font-black text-amber-400/90">{user.games_lost ?? '—'}</div>
              <div>
                <Trans>Losses</Trans>
              </div>
            </div>
            <div className="rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2">
              <div className="font-black text-amber-400/90">{user.wins_as_wendigo ?? '—'}</div>
              <div>
                <Trans>Wendigo</Trans>
              </div>
            </div>
            <div className="col-span-2 rounded-lg border border-[#2d261f]/80 bg-[#0f0c09]/80 px-2 py-2 sm:col-span-1">
              <div className="font-black text-amber-400/90">{user.wins_as_villager ?? '—'}</div>
              <div>
                <Trans>Village</Trans>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mb-4 flex flex-col">
          <label htmlFor="profile-username" className={labelClass}>
            <Trans>Username</Trans>
          </label>
          <input
            id="profile-username"
            name="username"
            type="text"
            autoComplete="username"
            value={safeTrim(user?.username)}
            disabled
            readOnly
            className={inputClass}
          />

          <label htmlFor="profile-email" className={labelClass}>
            <Trans>Email</Trans>
          </label>
          <input
            id="profile-email"
            name="email"
            type="email"
            autoComplete="email"
            value={safeTrim(user?.email)}
            disabled
            readOnly
            className={inputClass}
          />
        </div>

        <VoxelButton type="button" variant="danger" className="w-full" onClick={() => transitionTo('/')}>
          <Trans>Back to menu</Trans>
        </VoxelButton>
      </div>
    </div>
  )
}

export default ProfilePage
