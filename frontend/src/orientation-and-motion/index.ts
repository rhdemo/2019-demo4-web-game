import * as webmo from 'webmo'
import {
  OrientationListener,
  OrientationListenerEvent
} from 'webmo/src/orientation'
import { MotionListener, MotionListenerEvent } from 'webmo/src/motion'
import { MotionVectors } from '@app/interfaces'
import { sendMotionAndOrientationData } from '@app/websocks/ws'
import nanoid from 'nanoid'
import { addGestureToHistory } from '@app/store'
import getLogger from '@app/log'

const log = getLogger('motion')

type EmitterCallback = (data: MotionVectors) => void

const isProduction = process.env.NODE_ENV === 'production'

let ol: OrientationListener
let ml: MotionListener

let oBuffer: OrientationListenerEvent[] = []
let mBuffer: MotionListenerEvent[] = []

let emitterInterval: NodeJS.Timer | null = null

// Default callback for handling device data
let _callback: EmitterCallback = (data) => {
  const uuid = nanoid()
  // TODO - Need to get this from our central state store
  // TODO - The server will eventually send us the motion
  const gesture = 'todo'

  sendMotionAndOrientationData({ ...data, uuid })
  addGestureToHistory({ uuid, gesture })
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
  callback?: EmitterCallback
) {
  if (callback) {
    _callback = callback
  }

  const supports = await Promise.all([
    webmo.motion.deviceHasMotionSupport(),
    webmo.orientation.deviceHasOrientationSupport()
  ])

  const autoStart = false

  // If mode is dev then just ignore the check results, e.g running on desktop
  if (!isProduction || (supports[0] && supports[1])) {
    ml = new MotionListener((e) => mBuffer.push(e), {
      autoStart,
      threshold: 2,
      rotationRateThreshold: 2.5
    })
    ol = new OrientationListener((e) => oBuffer.push(e), {
      autoStart,
      threshold: 2,
      rotationRateThreshold: 2.5
    })
    ol = new OrientationListener((e) => oBuffer.push(e), {
      autoStart,
      threshold: 0.5
    })
  } else {
    throw new Error(
      `Device does not support motion (check: ${
        supports[0]
      }) or orientation (check: ${supports[1]})`
    )
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
