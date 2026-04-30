import { useCallback, useEffect, useRef } from 'react'
import type { LobbyState } from '@/api/game'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'

type ClientMessageType = 'CLAIM_SEAT' | 'VOTE' | 'START_GAME' | string
type ServerMessageType = 'LOBBY_SYNC' | 'GAME_TICK' | 'ERROR' | string

interface BaseSocketMessage<TType extends string, TPayload> {
  type: TType
  payload: TPayload
}

interface RawPlayerPayload {
  id: string
  name: string
  role?: string | null
  isAlive?: boolean
  is_alive?: boolean
  isHost?: boolean
  is_host?: boolean
}

interface RawLobbyPayload {
  code: string
  phase: string
  mode?: string
  players: RawPlayerPayload[]
  timeRemaining?: number
  time_remaining?: number
  winnerTeam?: string
  winner_team?: string
  maxPlayers?: number
  max_players?: number
  minPlayers?: number
  min_players?: number
}

interface GameTickPayload extends RawLobbyPayload {
  livekit_token?: string
}

type LobbySyncMessage = BaseSocketMessage<'LOBBY_SYNC', RawLobbyPayload>
type GameTickMessage = BaseSocketMessage<'GAME_TICK', GameTickPayload>
type ErrorMessage = BaseSocketMessage<'ERROR', { message?: string }>
type IncomingSocketMessage =
  | LobbySyncMessage
  | GameTickMessage
  | ErrorMessage
  | BaseSocketMessage<ServerMessageType, unknown>

type OutgoingSocketMessage<TPayload = unknown> = BaseSocketMessage<ClientMessageType, TPayload>

const buildWebSocketUrl = (token: string, lobbyCode: string, displayName: string): string => {
  const explicitWsUrl = import.meta.env.VITE_WS_URL as string | undefined
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080'
  const baseUrl = explicitWsUrl ?? apiUrl
  const parsed = new URL(baseUrl)

  parsed.protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:'
  parsed.pathname = '/ws'
  parsed.search = ''
  parsed.searchParams.set('token', token)
  parsed.searchParams.set('code', lobbyCode)
  const name = displayName.trim()
  if (name.length > 0) {
    parsed.searchParams.set('name', name)
  }

  return parsed.toString()
}

interface UseGameWebSocketOptions {
  onInvalidLobby?: (message: string) => void
}

const isLobbySyncMessage = (message: IncomingSocketMessage): message is LobbySyncMessage =>
  message.type === 'LOBBY_SYNC'

const isGameTickMessage = (message: IncomingSocketMessage): message is GameTickMessage =>
  message.type === 'GAME_TICK'

const isErrorMessage = (message: IncomingSocketMessage): message is ErrorMessage =>
  message.type === 'ERROR'

const normalizeLobbyPayload = (payload: RawLobbyPayload): LobbyState => ({
  code: payload.code,
  phase: payload.phase,
  mode: payload.mode,
  timeRemaining: payload.timeRemaining ?? payload.time_remaining ?? 0,
  winnerTeam: payload.winnerTeam ?? payload.winner_team,
  maxPlayers: payload.maxPlayers ?? payload.max_players,
  minPlayers: payload.minPlayers ?? payload.min_players,
  players: payload.players.map((player) => ({
    id: player.id,
    name: player.name,
    role: player.role ?? null,
    isAlive: player.isAlive ?? player.is_alive ?? true,
    isHost: player.isHost ?? player.is_host ?? false,
  })),
})

export const useGameWebSocket = (
  lobbyCode: string | undefined,
  options?: UseGameWebSocketOptions
) => {
  const wsRef = useRef<WebSocket | null>(null)
  const didReceiveLobbySyncRef = useRef(false)
  const isUnmountingRef = useRef(false)
  const setLobby = useGameStore((state) => state.setLobby)
  const setConnected = useGameStore((state) => state.setConnected)
  const setLiveKitToken = useGameStore((state) => state.setLiveKitToken)
  const resetGame = useGameStore((state) => state.resetGame)
  const onInvalidLobby = options?.onInvalidLobby
  const notifyInvalidLobby = useCallback(
    (message: string) => {
      toast.error(message)
      onInvalidLobby?.(message)
    },
    [onInvalidLobby]
  )

  useEffect(() => {
    if (!lobbyCode) {
      return
    }

    const { token, user } = useAuthStore.getState()

    if (!token) {
      notifyInvalidLobby('Authentication required.')
      resetGame()
      return
    }

    didReceiveLobbySyncRef.current = false
    isUnmountingRef.current = false
    const displayName = user?.username ?? ''
    const ws = new WebSocket(buildWebSocketUrl(token, lobbyCode, displayName))
    wsRef.current = ws

    ws.onopen = () => {
      setConnected(true)
    }

    ws.onmessage = (event: MessageEvent<string>) => {
      try {
        const message = JSON.parse(event.data) as IncomingSocketMessage

        if (isLobbySyncMessage(message)) {
          didReceiveLobbySyncRef.current = true
          setLobby(normalizeLobbyPayload(message.payload))
          return
        }

        if (isGameTickMessage(message)) {
          didReceiveLobbySyncRef.current = true
          setLobby(normalizeLobbyPayload(message.payload))
          const nextToken = message.payload.livekit_token ?? null
          const currentToken = useGameStore.getState().livekitToken
          if (nextToken !== currentToken) {
            setLiveKitToken(nextToken)
          }
          return
        }

        if (isErrorMessage(message)) {
          notifyInvalidLobby(message.payload.message ?? 'Unable to join this lobby.')
        }
      } catch {
        notifyInvalidLobby('Invalid server response.')
      }
    }

    ws.onerror = () => {
      notifyInvalidLobby('WebSocket connection failed.')
    }

    ws.onclose = () => {
      setConnected(false)
      wsRef.current = null

      if (!isUnmountingRef.current && !didReceiveLobbySyncRef.current) {
        notifyInvalidLobby('Lobby not found or no longer available.')
      }
    }

    return () => {
      isUnmountingRef.current = true
      ws.close()
      resetGame()
    }
  }, [lobbyCode, notifyInvalidLobby, resetGame, setConnected, setLiveKitToken, setLobby])

  const disconnect = useCallback(() => {
    isUnmountingRef.current = true
    const ws = wsRef.current
    wsRef.current = null
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close(1000, 'client leave')
    } else if (ws && ws.readyState === WebSocket.CONNECTING) {
      ws.close()
    }
    setConnected(false)
    resetGame()
  }, [resetGame, setConnected])

  const sendMessage = useCallback(<TPayload,>(type: ClientMessageType, payload: TPayload) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false
    }

    const message: OutgoingSocketMessage<TPayload> = { type, payload }
    ws.send(JSON.stringify(message))
    return true
  }, [])

  return { sendMessage, disconnect }
}
