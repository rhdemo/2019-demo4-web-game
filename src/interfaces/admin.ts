import { ConfigGameMode } from '@app/interfaces/index'

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
    text: ConfigGameMode.Lobby,
  },
  Active: {
    text: ConfigGameMode.Active,
  },
  Paused: {
    text: ConfigGameMode.Paused,
  },
  Stopped: {
    text: ConfigGameMode.Stopped,
  },
}
