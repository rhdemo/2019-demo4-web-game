import { ConfigGameMode } from '@app/interfaces/index'

export interface GameModeEntry {
  text: string
}

export interface GameModesInterface {
  // Index Signature - tells the compiler index is a string type
  // Allows type safe looping and access, e.g in Object.keys/map loops
  [index: string]: GameModeEntry

  Lobby: GameModeEntry
  Play: GameModeEntry
  Pause: GameModeEntry
  GameOver: GameModeEntry
}

export const GameModes: GameModesInterface = {
  Lobby: {
    text: ConfigGameMode.Lobby
  },
  Play: {
    text: ConfigGameMode.Active
  },
  Pause: {
    text: ConfigGameMode.Paused
  },
  GameOver: {
    text: ConfigGameMode.Stopped
  }
}
