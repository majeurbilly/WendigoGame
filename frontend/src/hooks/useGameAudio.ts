import { useCallback } from 'react'
import { useAudioStore } from '@/store/useAudioStore'
import useSound from 'use-sound'

const warnAudio = (name: string, error: unknown) => {
  // Keep gameplay resilient when a sound asset is temporarily missing.
  console.warn(`[audio] ${name} unavailable`, error)
}

export const useGameAudio = () => {
  const volume = useAudioStore((state) => state.volume)
  const isMuted = useAudioStore((state) => state.isMuted)
  const effectiveVolume = useCallback(
    (baseVolume: number) => (isMuted ? 0 : baseVolume * volume),
    [isMuted, volume]
  )

  const [playHeartbeatRaw, { stop: stopHeartbeatRaw }] = useSound('/sounds/heartbeat-loop.mp3', {
    loop: true,
    volume: effectiveVolume(0.5),
  })
  const [playLockRaw] = useSound('/sounds/action-lock.mp3', { volume: effectiveVolume(0.8) })
  const [playNightFallRaw] = useSound('/sounds/night-fall.mp3', { volume: effectiveVolume(0.7) })
  const [playDayBreakRaw] = useSound('/sounds/day-break.mp3', { volume: effectiveVolume(0.6) })
  const [playGameOverRaw] = useSound('/sounds/game-over.mp3', { volume: effectiveVolume(0.9) })

  const playHeartbeat = useCallback(() => {
    try {
      playHeartbeatRaw()
    } catch (error) {
      warnAudio('heartbeat-loop.mp3', error)
    }
  }, [playHeartbeatRaw])

  const stopHeartbeat = useCallback(() => {
    try {
      stopHeartbeatRaw()
    } catch (error) {
      warnAudio('heartbeat-loop.mp3', error)
    }
  }, [stopHeartbeatRaw])

  const playLock = useCallback(() => {
    try {
      playLockRaw()
    } catch (error) {
      warnAudio('action-lock.mp3', error)
    }
  }, [playLockRaw])

  const playNightFall = useCallback(() => {
    try {
      playNightFallRaw()
    } catch (error) {
      warnAudio('night-fall.mp3', error)
    }
  }, [playNightFallRaw])

  const playDayBreak = useCallback(() => {
    try {
      playDayBreakRaw()
    } catch (error) {
      warnAudio('day-break.mp3', error)
    }
  }, [playDayBreakRaw])

  const playGameOver = useCallback(() => {
    try {
      playGameOverRaw()
    } catch (error) {
      warnAudio('game-over.mp3', error)
    }
  }, [playGameOverRaw])

  return {
    playHeartbeat,
    stopHeartbeat,
    playLock,
    playNightFall,
    playDayBreak,
    playGameOver,
  }
}
