import * as webmo from 'webmo'
import {
  OrientationListener,
  OrientationListenerEvent
} from 'webmo/src/orientation'
import { MotionListener, MotionListenerEvent } from 'webmo/src/motion'
import { MotionVectors } from '@app/interfaces'
import { sendMotionAndOrientationData } from '@app/websocks/ws'
import { addCurrentGestureToHistory, ApplicationEventTypes, emitter, getCurrentSelectedGesture } from '@app/store'
import nanoid from 'nanoid'
import getLogger from '@app/log'

const log = getLogger('motion')

// This represents the index of a timestamp in the motion and orientation data
const TS_INDEX = 6
// We must have motion events that span more than this time (in milliseconds)
const MIN_MOTION_CAP_LEN = 2000
// Time to wait for events before deciding the device lacks motion support
const SUPPORTS_CHECK_TIMEOUT = 5000

const DEFAULT_MOTION_OPTS = {
  autoStart: false,
  threshold: 2.5,
  rotationRateThreshold: Infinity
}

const DEFAULT_ORIENTATION_OPTS = {
  autoStart: false,
  threshold: 5
}

const isProduction = process.env.NODE_ENV === 'production'

let ol: OrientationListener
let ml: MotionListener

let oBuffer: OrientationListenerEvent[] = []
let mBuffer: MotionListenerEvent[] = []

let emitterInterval: NodeJS.Timer | null = null

// Default callback for handling device data
type EmitterCallback = (data: MotionVectors) => void

let _callback: EmitterCallback = (data) => {
  if (hasSufficientMotionData(data)) {
    const uuid = nanoid()

    addCurrentGestureToHistory(uuid)

    log('sending motion data to the server')
    sendMotionAndOrientationData({ ...data, uuid, gesture: getCurrentSelectedGesture() || 'unspecified' })
    emitter.emit(ApplicationEventTypes.MotionUpdate, data)
  } else {
    log('data captured but not sent was:', data)
  }
}

export class DeviceMotionUnavailableError extends Error {
  constructor (
    public readonly motionSupported: boolean,
    public readonly orientationSupported: boolean
  ) {
    super('Device motion and orientation data appears to be unavailable.')

    Object.setPrototypeOf(this, DeviceMotionUnavailableError.prototype)
  }
}

/**
 * Stops the periodic sending of data to WSS
 */
export function stopSendLoop () {
  log('stopping send loop')
  if (emitterInterval === null) {
    console.warn('stopSendLoop was called, but tracking is currently inactive')
  } else {
    clearInterval(emitterInterval)
    emitterInterval = null

    ml.stop()
    ol.stop()

    clearBuffers()

    log('send loop stopped, interval and buffers cleared')
  }
}

/**
 * Starts sending data to the WSS on an interval
 */
export function startSendLoop (timeout = 5000) {
  log('starting send loop')
  if (emitterInterval) {
    console.warn('startSendLoop was called, but tracking is currently active')
  } else {
    clearBuffers()

    ml.start()
    ol.start()

    emitterInterval = setInterval(emitMotionAndOrientation, timeout)
  }
}

export function isActive () {
  return emitterInterval !== null
}

/**
 * Verifies that the current device supports motion and orientation APIs
 * Sets us up to send data to the backend
 */
export async function initialiseMotionAndOrientationTracking (
  callback?: EmitterCallback,
  options?:
    | { mOpts?: webmo.ListenerOptions; oOpts?: webmo.ListenerOptions }
    | undefined
) {
  if (callback) {
    _callback = callback
  }

  const supports = await Promise.all([
    // Wait a little longer than the default 1 second so slower devices
    webmo.motion.deviceHasMotionSupport(SUPPORTS_CHECK_TIMEOUT),
    webmo.orientation.deviceHasOrientationSupport(SUPPORTS_CHECK_TIMEOUT)
  ])

  // If mode is dev then just ignore the check results, e.g running on desktop
  if (!isProduction || (supports[0] && supports[1])) {
    log('initialising motion capture')

    ml = new MotionListener(
      (e) => mBuffer.push(e),
      Object.assign({}, DEFAULT_MOTION_OPTS, options ? options.mOpts : {})
    )

    ol = new OrientationListener(
      (e) => oBuffer.push(e),
      Object.assign({}, DEFAULT_ORIENTATION_OPTS, options ? options.oOpts : {})
    )
  } else {
    log('device motion appears to be unavailable')
    throw new DeviceMotionUnavailableError(supports[0], supports[1])
  }
}

function clearBuffers () {
  log('clearing motion buffers')
  oBuffer = []
  mBuffer = []
}

function round (n: number) {
  return parseFloat(n.toFixed(5))
}

function vectoriseMotionEvent (data: MotionListenerEvent) {
  return [
    round(data.acceleration.x),
    round(data.acceleration.y),
    round(data.acceleration.z),
    round(data.rotationRate.alpha),
    round(data.rotationRate.beta),
    round(data.rotationRate.gamma),
    data.timestamp
  ]
}

function vectoriseOrientationEvent (data: OrientationListenerEvent) {
  return [
    round(data.alpha),
    round(data.beta),
    round(data.gamma),
    data.timestamp
  ]
}

function emitMotionAndOrientation () {
  log('emitting motion data')
  const data = {
    orientation: oBuffer.map(vectoriseOrientationEvent),
    motion: mBuffer.map(vectoriseMotionEvent)
  }

  clearBuffers()

  _callback(data)
}

function hasSufficientMotionData (data: MotionVectors) {
  if (data.motion.length < 15) {
    // User is not attempting gestures, don't bother sending anything
    // We check motion, since orientation tends to give false positives
    log('not sending "motion", too few events captured')
    return false
  }

  if (data.motion[data.motion.length - 1][TS_INDEX] - data.motion[0][TS_INDEX] < MIN_MOTION_CAP_LEN) {
    // Captured motions do not span a sufficient time period
    log('not sending "motion", events do not span enough time')
    return false
  }

  return true
}
