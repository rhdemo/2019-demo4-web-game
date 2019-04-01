import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types'
import { ConfigGameMode, GameConfiguration, GestureHistoryEntry, WSS } from './interfaces'
import getLogger from '@app/log'
import { stat } from 'fs'
import { isDeviceSupported } from './utils';

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
  unsupportedDevice: boolean
}

const playerId = localStorage.getItem('playerId') || undefined
const state: ApplicationState = {
  // Always initialise in loading state
  config: {
    gameState: ConfigGameMode.Loading,
    playerId,
    motions: {},
  },
  unsupportedDevice: !isDeviceSupported(),
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

/**
 * Set the game mode, e.g "paused"
 * @param mode
 */
export function setGameMode (mode: ConfigGameMode) {
  state.config.gameState = mode

  emitter.emit(ApplicationEventTypes.ConfigUpdate, state.config)
}

/**
 * Replace the full game configuration
 * @param config
 */
export function setGameConfiguration (config: GameConfiguration) {
  log('setting game configuration to:', config)
  if (config.playerId) {
    localStorage.setItem('playerId', config.playerId)
  }

  state.config = config

  emitter.emit(ApplicationEventTypes.ConfigUpdate, config)
}

/**
 * Update the player score in the game configuration.
 * This is not additive, it will overwrite it with the passed value.
 * @param score
 */
export function setPlayerScore (score: number) {
  state.config.score = score

  // We don't really need a score event, can just reuse config for now...
  emitter.emit(ApplicationEventTypes.ConfigUpdate, state.config)
}

/**
 * Tracks gesture history so we can match server confirmations to a previously performed gesture
 * @param entry
 */
export function addGestureToHistory (entry: GestureHistoryEntry) {
  state.gestureHistory.push(entry)
}

/**
 * Deletes all stored gestures. Required on certain mode changes
 * @param entry
 */
export function clearGestureToHistory (entry: GestureHistoryEntry) {
  state.gestureHistory = []
}