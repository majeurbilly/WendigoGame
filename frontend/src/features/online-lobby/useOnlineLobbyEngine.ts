import { type RefObject, useCallback, useEffect, useRef } from 'react'
import {
  GRAVITY,
  MOVE_SPEED,
  getSkinById,
  type GameState,
  createInitialGameState,
} from './types'
const FLOOR_COLOR = '#2d261f'
const FLOOR_TOP_COLOR = '#4a3f35'
const SKY_COLOR = '#0f1419'
const WALL_COLOR = '#1a1612'

const KEY_LEFT = new Set(['ArrowLeft', 'a', 'A'])
const KEY_RIGHT = new Set(['ArrowRight', 'd', 'D'])

function applyInputToVelocity(state: GameState): void {
  const { player, inputs } = state
  if (inputs.left && !inputs.right) {
    player.vx = -MOVE_SPEED
  } else if (inputs.right && !inputs.left) {
    player.vx = MOVE_SPEED
  } else {
    player.vx = 0
  }
}

function updatePhysics(state: GameState, dt: number): void {
  const { player, floorY, worldWidth } = state

  applyInputToVelocity(state)

  player.vy += GRAVITY * dt
  player.x += player.vx * dt
  player.y += player.vy * dt

  const minX = 0
  const maxX = worldWidth - player.width
  if (player.x < minX) {
    player.x = minX
    player.vx = 0
  } else if (player.x > maxX) {
    player.x = maxX
    player.vx = 0
  }

  const floorTop = floorY
  if (player.y + player.height >= floorTop) {
    player.y = floorTop - player.height
    player.vy = 0
    player.onGround = true
  } else {
    player.onGround = false
  }
}

interface ViewportTransform {
  scale: number
  offsetX: number
  offsetY: number
  cssWidth: number
  cssHeight: number
}

function computeViewportTransform(cssWidth: number, cssHeight: number, state: GameState): ViewportTransform {
  const scale = Math.min(cssWidth / state.worldWidth, cssHeight / state.worldHeight)
  const drawWidth = state.worldWidth * scale
  const drawHeight = state.worldHeight * scale
  const offsetX = (cssWidth - drawWidth) / 2
  const offsetY = (cssHeight - drawHeight) / 2
  return { scale, offsetX, offsetY, cssWidth, cssHeight }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  transform: ViewportTransform
): void {
  const { scale, offsetX, offsetY, cssWidth, cssHeight } = transform

  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = SKY_COLOR
  ctx.fillRect(0, 0, cssWidth, cssHeight)

  ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY)

  ctx.fillStyle = WALL_COLOR
  ctx.fillRect(0, 0, state.worldWidth, state.worldHeight)

  ctx.fillStyle = FLOOR_COLOR
  ctx.fillRect(0, state.floorY, state.worldWidth, state.worldHeight - state.floorY)
  ctx.fillStyle = FLOOR_TOP_COLOR
  ctx.fillRect(0, state.floorY, state.worldWidth, 6)

  const { player } = state
  const skin = getSkinById(player.currentSkinId)
  ctx.fillStyle = skin.color
  ctx.fillRect(player.x, player.y, player.width, player.height)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'
  ctx.lineWidth = 2
  ctx.strokeRect(player.x, player.y, player.width, player.height)
}

export interface OnlineLobbyEngineControls {
  setInputLeft: (pressed: boolean) => void
  setInputRight: (pressed: boolean) => void
  setCurrentSkinId: (skinId: string) => void
}

export function useOnlineLobbyEngine(
  canvasRef: RefObject<HTMLCanvasElement | null>
): OnlineLobbyEngineControls {
  const gameStateRef = useRef<GameState>(createInitialGameState())
  const rafIdRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number | null>(null)

  const setInputLeft = useCallback((pressed: boolean) => {
    gameStateRef.current.inputs.left = pressed
  }, [])

  const setInputRight = useCallback((pressed: boolean) => {
    gameStateRef.current.inputs.right = pressed
  }, [])

  const setCurrentSkinId = useCallback((skinId: string) => {
    gameStateRef.current.player.currentSkinId = skinId
  }, [])

  useEffect(() => {
    const syncKeyToInputs = (code: string, pressed: boolean) => {
      if (KEY_LEFT.has(code)) {
        gameStateRef.current.inputs.left = pressed
      }
      if (KEY_RIGHT.has(code)) {
        gameStateRef.current.inputs.right = pressed
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (KEY_LEFT.has(event.key) || KEY_RIGHT.has(event.key)) {
        event.preventDefault()
      }
      syncKeyToInputs(event.key, true)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      syncKeyToInputs(event.key, false)
    }

    const onBlur = () => {
      gameStateRef.current.inputs.left = false
      gameStateRef.current.inputs.right = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const cssWidth = window.innerWidth
      const cssHeight = window.innerHeight
      canvas.style.width = `${cssWidth}px`
      canvas.style.height = `${cssHeight}px`
      canvas.width = Math.floor(cssWidth * dpr)
      canvas.height = Math.floor(cssHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const tick = (now: number) => {
      const last = lastTimeRef.current
      lastTimeRef.current = now
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05)

      if (dt > 0) {
        updatePhysics(gameStateRef.current, dt)
      }

      const cssWidth = window.innerWidth
      const cssHeight = window.innerHeight
      const transform = computeViewportTransform(cssWidth, cssHeight, gameStateRef.current)
      drawFrame(ctx, gameStateRef.current, transform)

      rafIdRef.current = window.requestAnimationFrame(tick)
    }

    rafIdRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (rafIdRef.current !== null) {
        window.cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      lastTimeRef.current = null
    }
  }, [canvasRef])

  return { setInputLeft, setInputRight, setCurrentSkinId }
}
