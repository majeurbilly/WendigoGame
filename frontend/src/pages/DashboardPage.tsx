import MainLayout from '@/components/layouts/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import LobbyManager from '@/features/dashboard/components/LobbyManager'
import { useAuthStore } from '@/store/useAuthStore'

const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)

  const gamesPlayed = user?.games_played ?? 0
  const winsAsWendigo = user?.wins_as_wendigo ?? 0
  const winsAsVillager = user?.wins_as_villager ?? 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
          Welcome back, {user?.username ?? 'player'}!
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-300">
                Games played
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{gamesPlayed}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-300">
                Wins as Wendigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{winsAsWendigo}</p>
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-300">
                Wins as Villager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tabular-nums">{winsAsVillager}</p>
            </CardContent>
          </Card>
        </div>
        <LobbyManager />
      </div>
    </MainLayout>
  )
}

export default DashboardPage
