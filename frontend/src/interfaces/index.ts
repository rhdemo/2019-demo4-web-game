export enum ConfigGameMode {
  Active = 'active',
  Borked = 'borked',
  Paused = 'paused',
  Stopped = 'stopped',
  Loading = 'loading',
  Ready = 'ready',
  Lobby = 'lobby'
}

export interface GestureHistoryEntry {
  gesture: string
  uuid: string
}

export interface GameConfiguration {
  gameState: ConfigGameMode
  playerId: string
  machineId: string
  username: string // randomly generated by the backend
  score: number // users stored score. Zero if the player is new
  gameMotions: {
    // Moves will be in an on/off (true/false) state controlled by the admin interface
    [key: string]: boolean
    circle: boolean
    fever: boolean
    floss: boolean
    roll: boolean
    shake: boolean
    x: boolean
  }
}

export interface MotionVectors {
  orientation: number[][]
  motion: number[][]
}

export namespace WSS {
  export namespace OutgoingFrames {
    export enum Type {
      Motion = 'motion',
      MotionRaw = 'motion-raw',
      Training = 'training',
      GameStateChange = 'game',
      Connection = 'connection'
    }

    export interface OutgoingFrame {
      type: Type
      [key: string]: any
    }

    export interface MotionDataPayload {
      motion: number[][]
      orientation: number[][]
      uuid: string
      gesture?: string // TODO: enums for our planned gesture types
    }

    export interface GameStateChangePayload {
      state: string
    }

    export interface Connection {}
  }

  export namespace IncomingFrames {
    export enum Type {
      Config = 'configuration',
      Score = 'score',
      Heartbeat = 'heartbeat',
      MotionFeedback = 'motion_feedback'
    }

    export interface FrameBase {
      type: string
    }

    export interface Config extends FrameBase, GameConfiguration {
      type: Type.Config
    }

    export interface Score extends FrameBase {
      type: Type.Score
      total: number
      gesture: string // if we're recognizing gestures instead of just movement
      intensity: string // some kind of measure indicating the impact of the player's movements
      machineId: string // we need to identify the targetted machine, though we probably know in advance
    }

    export interface MotionFeedback extends FrameBase {
      type: Type.MotionFeedback
      uuid: string
      gesture: string
      correct: boolean
      probability: number,
      score: number
      prediction: {[gesture: string]: number}
    }

    export interface Heartbeat extends FrameBase {
      type: Type.Heartbeat
    }

    export interface ClassifiedFrame {
      type: Type
      data: Config | Score | Heartbeat
    }
  }
}
