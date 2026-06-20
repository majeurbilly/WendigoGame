/** Touches / boutons tactiles — jamais dans useState React. */
export interface InputState {
  left: boolean
  right: boolean
}

export interface PlayerSkin {
  id: string
  color: string
}

export const PLAYER_SKINS: readonly PlayerSkin[] = [
  { id: 'amber', color: '#f59e0b' },
  { id: 'red', color: '#ef4444' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'green', color: '#22c55e' },
] as const

export const DEFAULT_SKIN_ID = PLAYER_SKINS[0].id

export function getSkinById(skinId: string): PlayerSkin {
  return PLAYER_SKINS.find((skin) => skin.id === skinId) ?? PLAYER_SKINS[0]
}

export interface PlayerPhysics {
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
  onGround: boolean
  currentSkinId: string
}

/** Monde logique (ratio fixe) + joueur + inputs. */
export interface GameState {
  worldWidth: number
  worldHeight: number
  floorY: number
  player: PlayerPhysics
  inputs: InputState
}

export const LOGICAL_WORLD_WIDTH = 1280
export const LOGICAL_WORLD_HEIGHT = 720

export const PLAYER_SIZE = 48
export const FLOOR_HEIGHT = 64

export const GRAVITY = 1800
export const MOVE_SPEED = 320

export function createInitialGameState(): GameState {
  const floorY = LOGICAL_WORLD_HEIGHT - FLOOR_HEIGHT
  const playerWidth = PLAYER_SIZE
  const playerHeight = PLAYER_SIZE

  return {
    worldWidth: LOGICAL_WORLD_WIDTH,
    worldHeight: LOGICAL_WORLD_HEIGHT,
    floorY,
    player: {
      x: (LOGICAL_WORLD_WIDTH - playerWidth) / 2,
      y: floorY - playerHeight - 120,
      width: playerWidth,
      height: playerHeight,
      vx: 0,
      vy: 0,
      onGround: false,
      currentSkinId: DEFAULT_SKIN_ID,
    },
    inputs: {
      left: false,
      right: false,
    },
  }
}
