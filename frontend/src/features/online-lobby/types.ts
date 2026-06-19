/** Touches / boutons tactiles — jamais dans useState React. */
export interface InputState {
  left: boolean
  right: boolean
}

export interface PlayerPhysics {
  x: number
  y: number
  width: number
  height: number
  vx: number
  vy: number
  onGround: boolean
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
    },
    inputs: {
      left: false,
      right: false,
    },
  }
}
