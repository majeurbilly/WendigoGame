import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createLobbyAPI } from '@/api/game'
import { getApiErrorMessage } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const LobbyManager = () => {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [createMode, setCreateMode] = useState<'local' | 'online'>('local')

  const handleCreateGame = async () => {
    setIsCreating(true)
    try {
      const code = await createLobbyAPI(createMode)
      navigate(`/lobby/${code}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinGame = () => {
    const code = joinCode.trim().toUpperCase()
    if (!code) {
      toast.error('Please enter a lobby code.')
      return
    }

    navigate(`/lobby/${code}`)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle>Create Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Mode de partie</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 has-[:checked]:border-amber-500/50 has-[:checked]:bg-amber-500/10">
                <input
                  type="radio"
                  name="create-mode"
                  className="accent-amber-500"
                  checked={createMode === 'local'}
                  onChange={() => setCreateMode('local')}
                />
                <span className="text-sm text-slate-200">Local (présentiel)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 has-[:checked]:border-sky-500/50 has-[:checked]:bg-sky-500/10">
                <input
                  type="radio"
                  name="create-mode"
                  className="accent-sky-500"
                  checked={createMode === 'online'}
                  onChange={() => setCreateMode('online')}
                />
                <span className="text-sm text-slate-200">Online (en ligne)</span>
              </label>
            </div>
          </div>
          <Button type="button" className="w-full" onClick={handleCreateGame} disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Lobby'}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle>Join Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder="Lobby code"
            className="uppercase"
            maxLength={12}
          />
          <Button type="button" className="w-full" onClick={handleJoinGame}>
            Join
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default LobbyManager
