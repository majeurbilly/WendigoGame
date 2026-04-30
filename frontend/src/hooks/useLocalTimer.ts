import { useEffect, useState } from 'react'

export const useLocalTimer = (serverTimeRemaining: number): number => {
  const [localTime, setLocalTime] = useState<number>(Math.max(0, Math.floor(serverTimeRemaining)))

  useEffect(() => {
    setLocalTime(Math.max(0, Math.floor(serverTimeRemaining)))
  }, [serverTimeRemaining])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLocalTime((previousTime) => Math.max(0, previousTime - 1))
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  return localTime
}
