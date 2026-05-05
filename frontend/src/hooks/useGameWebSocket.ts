import { useCallback, useEffect, useRef } from 'react'
import { defaultPhaseSettings, type LobbyState, type PhaseSettings } from '@/api/game'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/useAuthStore'
import { useGameStore } from '@/store/useGameStore'

type ClientMessageType =
  | 'CLAIM_SEAT'
  | 'VOTE'
  | 'VOTE_DAY'
  | 'ACCUSE'
  | 'WENDIGO_INTENT'
  | 'START_PLEADING'
  | 'START_GAME'
  | 'UPDATE_PHASE_SETTINGS'
  | 'LEAVE_LOBBY'
  | string
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
  chairId?: number
  chair_id?: number
  isExcludedFromCouncil?: boolean
  is_excluded_from_council?: boolean
}

interface RawPhaseSettingsPayload {
  chair_selection_seconds?: number
  day_social_seconds?: number
  council_start_seconds?: number
  council_accusation_post_chair_seconds?: number
  council_accusation_after_day_seconds?: number
  pleading_speech_seconds?: number
  council_vote_seconds?: number
  night_seconds?: number
  post_night_day_seconds?: number
}

interface RawLobbyPayload {
  code: string
  phase: string
  mode?: string
  players: RawPlayerPayload[]
  timeRemaining?: number
  time_remaining?: number
  phaseTotalSeconds?: number
  phase_total_seconds?: number
  phaseSettings?: PhaseSettings
  phase_settings?: RawPhaseSettingsPayload
  socialPhaseTotalTime?: number
  social_phase_total_time?: number
  chairPromptTriggered?: boolean
  chair_prompt_triggered?: boolean
  councilAccusations?: Record<string, string>
  council_accusations?: Record<string, string>
  wendigoIntentions?: Record<string, string>
  wendigo_intentions?: Record<string, string>
  prayerTallies?: Record<string, number>
  prayer_tallies?: Record<string, number>
  pleadingsQueue?: string[]
  pleadings_queue?: string[]
  currentSpeakerId?: string
  current_speaker_id?: string
  pleadingTimerStarted?: boolean
  pleading_timer_started?: boolean
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
  const basePath = parsed.pathname.replace(/\/+$/, '')
  parsed.pathname = `${basePath}/ws`.replace(/\/{2,}/g, '/')
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

const normalizePhaseSettingsPayload = (raw?: RawPhaseSettingsPayload): PhaseSettings => {
  const d = defaultPhaseSettings()
  if (!raw) {
    return d
  }
  const n = (v: unknown, fallback: number) => {
    const x = Number(v)
    return Number.isFinite(x) && x > 0 ? x : fallback
  }
  return {
    chairSelectionSeconds: n(raw.chair_selection_seconds, d.chairSelectionSeconds),
    daySocialSeconds: n(raw.day_social_seconds, d.daySocialSeconds),
    councilStartSeconds: n(raw.council_start_seconds, d.councilStartSeconds),
    councilAccusationPostChairSeconds: n(
      raw.council_accusation_post_chair_seconds,
      d.councilAccusationPostChairSeconds
    ),
    councilAccusationAfterDaySeconds: n(
      raw.council_accusation_after_day_seconds,
      d.councilAccusationAfterDaySeconds
    ),
    pleadingSpeechSeconds: n(raw.pleading_speech_seconds, d.pleadingSpeechSeconds),
    councilVoteSeconds: n(raw.council_vote_seconds, d.councilVoteSeconds),
    nightSeconds: n(raw.night_seconds, d.nightSeconds),
    postNightDaySeconds: n(raw.post_night_day_seconds, d.postNightDaySeconds),
  }
}

const logWs = (message: string, detail?: unknown) => {
  if (!import.meta.env.DEV) {
    return
  }
  if (detail !== undefined) {
    console.log(`[useGameWebSocket] ${message}`, detail)
    return
  }
  console.log(`[useGameWebSocket] ${message}`)
}

const normalizeLobbyPayload = (payload: RawLobbyPayload): LobbyState => ({
  code: payload.code,
  phase: payload.phase,
  mode: payload.mode,
  timeRemaining: payload.timeRemaining ?? payload.time_remaining ?? 0,
  phaseTotalSeconds: payload.phaseTotalSeconds ?? payload.phase_total_seconds,
  phaseSettings: payload.phaseSettings ?? normalizePhaseSettingsPayload(payload.phase_settings),
  socialPhaseTotalTime: payload.socialPhaseTotalTime ?? payload.social_phase_total_time,
  chairPromptTriggered: payload.chairPromptTriggered ?? payload.chair_prompt_triggered,
  councilAccusations: payload.councilAccusations ?? payload.council_accusations ?? {},
  wendigoIntentions: payload.wendigoIntentions ?? payload.wendigo_intentions ?? {},
  prayerTallies: payload.prayerTallies ?? payload.prayer_tallies ?? {},
  pleadingsQueue: payload.pleadingsQueue ?? payload.pleadings_queue ?? [],
  currentSpeakerId: payload.currentSpeakerId ?? payload.current_speaker_id,
  pleadingTimerStarted: payload.pleadingTimerStarted ?? payload.pleading_timer_started ?? false,
  winnerTeam: payload.winnerTeam ?? payload.winner_team,
  maxPlayers: payload.maxPlayers ?? payload.max_players,
  minPlayers: payload.minPlayers ?? payload.min_players,
  players: payload.players.map((player) => ({
    id: player.id,
    name: player.name,
    role: player.role ?? null,
    isAlive: player.isAlive ?? player.is_alive ?? true,
    isHost: player.isHost ?? player.is_host ?? false,
    chairId: player.chairId ?? player.chair_id ?? -1,
    isExcludedFromCouncil: player.isExcludedFromCouncil ?? player.is_excluded_from_council ?? false,
  })),
})

export const useGameWebSocket = (
  lobbyCode: string | undefined,
  options?: UseGameWebSocketOptions
) => {
  const wsRef = useRef<WebSocket | null>(null)
  const didReceiveLobbySyncRef = useRef(false)
  const isUnmountingRef = useRef(false)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimerRef = useRef<number | null>(null)
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
    reconnectAttemptsRef.current = 0
    const displayName = user?.username ?? ''
    const connect = () => {
      const ws = new WebSocket(buildWebSocketUrl(token, lobbyCode, displayName))
      wsRef.current = ws

      ws.onopen = () => {
        if (wsRef.current !== ws) {
          return
        }
        logWs('socket open', { lobbyCode })
        reconnectAttemptsRef.current = 0
        setConnected(true)
      }

      ws.onmessage = (event: MessageEvent<string>) => {
        if (wsRef.current !== ws) {
          return
        }
        try {
          const message = JSON.parse(event.data) as IncomingSocketMessage
          logWs('message reçu', { type: message.type })

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
            const errText = message.payload.message ?? 'Unable to join this lobby.'
            if (didReceiveLobbySyncRef.current) {
              toast.error(errText)
            } else {
              notifyInvalidLobby(errText)
            }
          }
        } catch {
          notifyInvalidLobby('Invalid server response.')
        }
      }

      ws.onerror = () => {
        // onclose handles retry/backoff and final user-facing fallback.
      }

      ws.onclose = () => {
        if (wsRef.current !== ws) {
          logWs('close ignoré (socket obsolète, ex. StrictMode / reconnexion)', { lobbyCode })
          return
        }
        wsRef.current = null
        logWs('socket fermé', { lobbyCode })
        setConnected(false)

        if (isUnmountingRef.current || didReceiveLobbySyncRef.current) {
          return
        }

        const maxReconnectAttempts = 3
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1
          const delayMs = reconnectAttemptsRef.current * 250
          reconnectTimerRef.current = window.setTimeout(() => {
            reconnectTimerRef.current = null
            if (!isUnmountingRef.current && !didReceiveLobbySyncRef.current) {
              connect()
            }
          }, delayMs)
          return
        }

        notifyInvalidLobby('Lobby not found or no longer available.')
      }
    }

    connect()

    return () => {
      isUnmountingRef.current = true
      if (reconnectTimerRef.current !== null) {
        window.clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      const ws = wsRef.current
      wsRef.current = null
      ws?.close()
      resetGame()
    }
  }, [lobbyCode, notifyInvalidLobby, resetGame, setConnected, setLiveKitToken, setLobby])

  const disconnect = useCallback(() => {
    isUnmountingRef.current = true
    const ws = wsRef.current
    wsRef.current = null
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify({ type: 'LEAVE_LOBBY', payload: null }))
      } catch {
        /* ignore */
      }
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
