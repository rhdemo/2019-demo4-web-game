import * as webmo from 'webmo'
import {
  OrientationListener,
  OrientationListenerEvent
} from 'webmo/src/orientation'
import { MotionListener, MotionListenerEvent } from 'webmo/src/motion'
import { MotionVectors } from '@app/interfaces'
import { sendMotionAndOrientationData } from '@app/websocks/ws'

type EmitterCallback = (data: MotionVectors) => void

const isProduction = process.env.NODE_ENV === 'production'

let ol: OrientationListener
let ml: MotionListener

let oBuffer: OrientationListenerEvent[] = []
let mBuffer: MotionListenerEvent[] = []

let emitterInterval: NodeJS.Timer | null = null

// Default callback for handling device data
let _callback: EmitterCallback = (data) => sendMotionAndOrientationData(data)

/**
 * Stops the periodic sending of data to WSS
 */
export function stopSendLoop () {
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
export function startSendLoop (timeout = 1000) {
  if (emitterInterval) {
    console.warn('startSendLoop was called, but tracking is currently active')
  } else {
    clearBuffers()

    ml.start()
    ol.start()

    emitterInterval = setInterval(emitMotionAndOrientation, timeout)
  }
}

/**
 * Verifies that the current device supports motion and orientation APIs
 * Sets us up to send data to the backend
 */
export async function initialiseMotionAndOrietationTracking (
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
    ml = new MotionListener((e) => mBuffer.push(e), { autoStart, threshold: 1 })
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
  const data = {
    orientation: oBuffer.map(vectoriseOrientationEvent),
    motion: mBuffer.map(vectoriseMotionEvent)
  }

  clearBuffers()

  _callback(data)
}
