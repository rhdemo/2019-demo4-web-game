
export interface GameModeEntry {
  text: string
}

export interface GameModesInterface {
  [index: string]: GameModeEntry

  Lobby: GameModeEntry,
  Play: GameModeEntry,
  Pause: GameModeEntry,
  GameOver: GameModeEntry
}

export const GameModes: GameModesInterface = {
  Lobby: {
    text: 'lobby'
  },
  Play: {
    text: 'play'
  },
  Pause: {
    text: 'pause'
  },
  GameOver: {
    text: 'gameover'
  }
}
