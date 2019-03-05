import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types'
import { ConfigGameMode, GameConfiguration, GestureHistoryEntry, WSS } from './interfaces'
import getLogger from '@app/log'

const log = getLogger('store')

/**
 * All application events should be listed here so we can type them
 * and therefore easily infer argument types in component listeners
 */
export enum ApplicationEventTypes {
  ScoreUpdate = 'ws:frame:score',
  ConfigUpdate = 'ws:frame:config',
  ServerHeartBeat = 'ws:frame:heartbeat',
  MotionUpdate = 'orientation-motion:update'
}

/**
 * Using the event enums/names defined above we now define the corresponding
 * handler signatures so we have a typed event system - yay!?
 */
export interface ApplicationEventHandlers {
  [ApplicationEventTypes.ScoreUpdate]: (data: WSS.IncomingFrames.Score) => void
  [ApplicationEventTypes.ConfigUpdate]: (data: WSS.IncomingFrames.Config | { gameState: ConfigGameMode }) => void
  [ApplicationEventTypes.MotionUpdate]: (data: { orientation: number[][], motion: number[][] }) => void
  [ApplicationEventTypes.ServerHeartBeat]: () => void
}

/**
 * Export our emitter using above types
 */
export const emitter: StrictEventEmitter<EventEmitter, ApplicationEventHandlers> = new EventEmitter()

export interface ApplicationState {
  config: GameConfiguration
  error?: Error
  gestureHistory: GestureHistoryEntry[]
}

const playerId = localStorage.getItem('playerId') || undefined
const state: ApplicationState = {
  // Always initialise in loading state
  config: { gameState: ConfigGameMode.Loading, playerId },
  gestureHistory: []
}

export function getState () {
  // TODO - make this a clone/frozen?
  return state
}

export function setError (err: Error) {
  log('setting error to:', err)
  state.error = err
}

export function setGameConfiguration (config: GameConfiguration) {
  log('setting game configuration to:', config)
  if (config.playerId) {
    localStorage.setItem('playerId', config.playerId)
  }

  state.config = config

  emitter.emit(ApplicationEventTypes.ConfigUpdate, config)
}

export function addGestureToHistory (entry: GestureHistoryEntry) {
  state.gestureHistory.push(entry)
}
