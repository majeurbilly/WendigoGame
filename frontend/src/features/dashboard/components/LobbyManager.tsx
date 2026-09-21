import { Trans, t } from '@/lib/lingui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '@/api/auth'
import { createLobbyAPI } from '@/api/game'
import { safeTrim } from '@/lib/safeTrim'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const LobbyManager = () => {
  const navigate = useNavigate()
  const [isCreating, setIsCreating] = useState(false)
  const [joinCode, setJoinCode] = useState('')

  const handleCreateGame = async () => {
    setIsCreating(true)
    try {
      const code = await createLobbyAPI()
      navigate(`/lobby/${code}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsCreating(false)
    }
  }

  const handleJoinGame = () => {
    const code = safeTrim(joinCode).toUpperCase()
    if (!code) {
      toast.error(t`Please enter a lobby code.`)
      return
    }

    navigate(`/lobby/${code}`)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle>
            <Trans>Create Game</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            <Trans>In-person party game — players share the same room.</Trans>
          </p>
          <Button type="button" className="w-full" onClick={() => void handleCreateGame()} disabled={isCreating}>
            {isCreating ? <Trans>Creating...</Trans> : <Trans>Create Lobby</Trans>}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/60 text-slate-100">
        <CardHeader>
          <CardTitle>
            <Trans>Join Game</Trans>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            value={joinCode}
            onChange={(event) => setJoinCode(event.target.value)}
            placeholder={t`Lobby code`}
            className="uppercase"
            maxLength={12}
          />
          <Button type="button" className="w-full" onClick={handleJoinGame}>
            <Trans>Join</Trans>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default LobbyManager
