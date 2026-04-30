import '@livekit/components-styles'
import { LiveKitRoom, RoomAudioRenderer, TrackToggle, useConnectionState } from '@livekit/components-react'
import { Track, ConnectionState } from 'livekit-client'
import { Card, CardContent } from '@/components/ui/card'

interface GameAudioRoomProps {
  token: string
}

const serverUrl = (import.meta.env.VITE_LIVEKIT_URL as string | undefined) ?? 'ws://localhost:7880'

const AudioControlsOverlay = () => {
  const connectionState = useConnectionState()
  const statusLabel =
    typeof connectionState === 'number'
      ? ConnectionState[connectionState] ?? 'Unknown'
      : String(connectionState)

  return (
    <Card className="w-72 border-slate-700 bg-slate-950/90 text-slate-100 shadow-lg shadow-black/40">
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Voice</p>
          <p className="text-sm font-medium text-slate-200">{statusLabel}</p>
        </div>
        <TrackToggle
          source={Track.Source.Microphone}
          className="rounded-md border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700"
        />
      </CardContent>
    </Card>
  )
}

const GameAudioRoom = ({ token }: GameAudioRoomProps) => {
  return (
    <div className="fixed right-4 bottom-4 z-50" data-lk-theme="default">
      <LiveKitRoom serverUrl={serverUrl} token={token} connect={true} audio={true}>
        <RoomAudioRenderer />
        <AudioControlsOverlay />
      </LiveKitRoom>
    </div>
  )
}

export default GameAudioRoom
