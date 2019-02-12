import { EventEmitter } from 'events'
import StrictEventEmitter from 'strict-event-emitter-types'
import { WebSocketFrames } from '@app/websocks/message-classifier'
import * as gyronorm from 'gyronorm'

/**
 * All application events should be listed here so we can type them
 * and therefore easily infer argument types in component listeners
 */
export namespace ApplicationEventTypes {
  export enum WebSocketEvents {
    Score = 'ws:frame:score',
    Config = 'ws:frame:config'
  }

  export enum OrientationMotionEvents {
    Update = 'orientation-motion:update'
  }
}

/**
 * Using the event enums/names defined above we now define the corresponding
 * handler signatures so we have a typed event system - yay!?
 */
export interface ApplicationEventHandlers {
  [ApplicationEventTypes.WebSocketEvents.Score]: (data: WebSocketFrames.Score) => void
  [ApplicationEventTypes.WebSocketEvents.Config]: (data: WebSocketFrames.Config) => void
  [ApplicationEventTypes.OrientationMotionEvents.Update]: (data: gyronorm.MotionAndOrientationPayload) => void
}

/**
 * Export our emitter using above types
 */
export const emitter: StrictEventEmitter<EventEmitter, ApplicationEventHandlers> = new EventEmitter()

export interface ApplicationState {
  activeMode: WebSocketFrames.ConfigGameMode
}

export const state: ApplicationState = {
  activeMode: WebSocketFrames.ConfigGameMode.Stopped
}
