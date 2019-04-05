import { ConfigGameMode } from '@app/interfaces/index'
import { MockGesture } from '@app/interfaces/mock-gestures/mock-gesture'
import { MockGestureX } from '@app/interfaces/mock-gestures/mock-x'
import { MockGestureCircle } from '@app/interfaces/mock-gestures/mock-circle'
import { MockGestureFever } from '@app/interfaces/mock-gestures/mock-fever'
import { MockGestureFloss } from '@app/interfaces/mock-gestures/mock-floss'
import { MockGestureRoll } from '@app/interfaces/mock-gestures/mock-roll'
import { MockGestureShake } from '@app/interfaces/mock-gestures/mock-shake'

export interface GameModeEntry {
  text: string
}

export interface GameModesInterface {
  // Index Signature - tells the compiler index is a string type
  // Allows type safe looping and access, e.g in Object.keys/map loops
  [index: string]: GameModeEntry

  Lobby: GameModeEntry
  Active: GameModeEntry
  Paused: GameModeEntry
  Stopped: GameModeEntry
}

export const GameModes: GameModesInterface = {
  Lobby: {
    text: ConfigGameMode.Lobby
  },
  Active: {
    text: ConfigGameMode.Active
  },
  Paused: {
    text: ConfigGameMode.Paused
  },
  Stopped: {
    text: ConfigGameMode.Stopped
  }
}

export const MockGestures: { [gesture: string]: MockGesture } = {
  'circle': MockGestureCircle,
  'fever': MockGestureFever,
  'floss': MockGestureFloss,
  'roll': MockGestureRoll,
  'shake': MockGestureShake,
  'x': MockGestureX
}
