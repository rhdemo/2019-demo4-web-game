import getLogger from '@app/log'
import StrictEventEmitter from 'strict-event-emitter-types'
import { EventEmitter } from 'events'
import { ConfigGameMode, GameConfiguration, GestureHistoryEntry, WSS } from './interfaces'
import { isDeviceSupported, getStoredPlayerId } from './utils'
import IncomingFrames = WSS.IncomingFrames

const log = getLogger('store')

/**
 * All application events should be listed here so we can type them
 * and therefore easily infer argument types in component listeners
 */
export enum ApplicationEventTypes {
  ScoreUpdate = 'ws:frame:score',
  ConfigUpdate = 'ws:frame:config',
  FeedbackUpdate = 'ws:frame:motion-feedback',
  ServerHeartBeat = 'ws:frame:heartbeat',
  MotionUpdate = 'orientation-motion:update',
  AppStateUpdate = 'app-state:update',
  SelectedGestureChange = 'app-state:gesture-change'
}

/**
 * Using the event enums/names defined above we now define the corresponding
 * handler signatures so we have a typed event system - yay!?
 */
export interface ApplicationEventHandlers {
  [ApplicationEventTypes.ScoreUpdate]: (data: WSS.IncomingFrames.Score) => void
  [ApplicationEventTypes.ConfigUpdate]: (data: WSS.IncomingFrames.Config | { gameState: ConfigGameMode }) => void
  [ApplicationEventTypes.FeedbackUpdate]: (data: WSS.IncomingFrames.MotionFeedback) => void
  [ApplicationEventTypes.MotionUpdate]: (data: { orientation: number[][], motion: number[][] }) => void
  [ApplicationEventTypes.ServerHeartBeat]: () => void
  [ApplicationEventTypes.AppStateUpdate]: () => void
  [ApplicationEventTypes.SelectedGestureChange]: () => void
}

/**
 * Export our emitter using above types
 */
export const emitter: StrictEventEmitter<EventEmitter, ApplicationEventHandlers> = new EventEmitter()

export interface ApplicationState {
  config: GameConfiguration
  error?: Error
  currentSelectedGesture?: string
  gestureHistory: GestureHistoryEntry[]
  feedbackHistory: IncomingFrames.MotionFeedback[]
  unsupportedDevice: boolean
  toastMessage?: string
}

const state: ApplicationState = {
  // Always initialise in loading state
  config: {
    gameState: ConfigGameMode.Loading,

    // Initially zero
    score: 0,

    // Just empty string by default
    playerId: getStoredPlayerId() || '',
    username: '',
    machineId: 0,

    // All disabled by default
    gameMotions: {
      circle: false,
      fever: false,
      floss: false,
      roll: false,
      shake: false,
      x: false
    }
  },
  unsupportedDevice: !isDeviceSupported(),
  gestureHistory: [],
  feedbackHistory: []
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

export function addLastMotionFeedback (feedback: IncomingFrames.MotionFeedback) {
  state.feedbackHistory.push(feedback)
  emitter.emit(ApplicationEventTypes.FeedbackUpdate, feedback)
}

/**
 * Tracks gesture history so we can match server confirmations to a previously performed gesture
 * @param entry
 */
export function addCurrentGestureToHistory (uuid: string) {
  const gesture = getState().currentSelectedGesture

  if (!gesture) {
    console.warn('called addCurrentGestureToHistory, but no gesture selection is present in the store')
    return
  }

  const entry: GestureHistoryEntry = {
    gesture,
    uuid
  }

  log('adding gesture to history: ', entry)

  state.gestureHistory.push(entry)
}

export function setCurrentSelectedGesture (gesture: string) {
  log(`setting current selected gesture to ${gesture}`)

  state.currentSelectedGesture = gesture

  // TODO: need reset the motion tracking if user changes gesture midway through capture
  emitter.emit(ApplicationEventTypes.SelectedGestureChange)
}

/**
 * Deletes all stored gestures. Required on certain mode changes
 * @param entry
 */
export function clearGestureToHistory (entry: GestureHistoryEntry) {
  log(`clearing gesture history`)
  state.gestureHistory = []
}

/**
 * Set a message to appear in a toast
 */
export function setToastMessage (toastMessage: string) {
  log(`setting toast message to ${toastMessage}`)
  state.toastMessage = toastMessage

  emitter.emit(ApplicationEventTypes.AppStateUpdate)
}
