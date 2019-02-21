import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types'
import { WebSocketFrames } from '@app/websocks/message-classifier'
import * as webmo from 'webmo'
import { ConfigGameMode, GameConfiguration } from './interfaces';

/**
 * All application events should be listed here so we can type them
 * and therefore easily infer argument types in component listeners
 */
export enum ApplicationEventTypes {
  ScoreUpdate = 'ws:frame:score',
  ConfigUpdate = 'ws:frame:config',
  MotionUpdate = 'orientation-motion:update'
}

/**
 * Using the event enums/names defined above we now define the corresponding
 * handler signatures so we have a typed event system - yay!?
 */
export interface ApplicationEventHandlers {
  [ApplicationEventTypes.ScoreUpdate]: (data: WebSocketFrames.Score) => void
  [ApplicationEventTypes.ConfigUpdate]: (data: WebSocketFrames.Config|{ gameState: ConfigGameMode }) => void
  [ApplicationEventTypes.MotionUpdate]: (data: { orientation: number[][], motion: number[][] }) => void
}

/**
 * Export our emitter using above types
 */
export const emitter: StrictEventEmitter<EventEmitter, ApplicationEventHandlers> = new EventEmitter()

export interface ApplicationState {
  config: GameConfiguration
  error?: Error
}

const state: ApplicationState = {
  // Always initialise in loading state
  config: { gameState: ConfigGameMode.Loading }
}

export function getState () {
  // TODO - make this a clone/frozen?
  return state
}

export function setError (err: Error) {
  console.log('setting error', err)
  state.error = err
}

export function setGameConfiguration (config: GameConfiguration) {
  state.config = config
  emitter.emit(ApplicationEventTypes.ConfigUpdate, config)
}
