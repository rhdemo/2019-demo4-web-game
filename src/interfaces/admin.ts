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
    text: 'lobby'
  },
  Active: {
    text: 'active'
  },
  Paused: {
    text: 'paused'
  },
  Stopped: {
    text: 'stopped'
  }
}
