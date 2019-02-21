import * as webmo from 'webmo'
import * as ws from '@app/websocks/ws';
import { OrientationListener, OrientationListenerEvent } from 'webmo/src/orientation';
import { MotionListener, MotionListenerEvent } from 'webmo/src/motion';

let ol: OrientationListener
let ml: MotionListener

let oBuffer: OrientationListenerEvent[] = []
let mBuffer: MotionListenerEvent[] = []

let emitterInterval: NodeJS.Timer|null = null

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
export function startSendLoop () {
  if (emitterInterval) {
    console.warn('startSendLoop was called, but tracking is currently active')
  } else {
    clearBuffers()

    ml.start()
    ol.start()

    // Emit motion data every second...for now
    emitterInterval = setInterval(emitMotionAndOrientation, 1000)
  }
}

/**
 * Verifies that the current device supports motion and orientation APIs
 */
export async function initialiseMotionAndOrietationTracking () {
  const supports = await Promise.all([
    webmo.motion.deviceHasMotionSupport(),
    webmo.orientation.deviceHasOrientationSupport()
  ])

  const autoStart = false

  if (supports[0] && supports[1]) {
    ml = new MotionListener((e) => mBuffer.push(e), { autoStart, threshold: 1 })
    ol = new OrientationListener((e) => oBuffer.push(e), { autoStart, threshold: 0.5 })
  } else {
    throw new Error(`Device does not support motion (check: ${supports[0]}) or orientation (check: ${supports[1]})`)
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
  return [round(data.acceleration.x), round(data.acceleration.y), round(data.acceleration.z), data.timestamp]
}

function vectoriseOrientationEvent (data: OrientationListenerEvent) {
  return [round(data.alpha), round(data.beta), round(data.gamma), data.timestamp]
}

function emitMotionAndOrientation () {
  const data = {
    orientation: oBuffer.map(vectoriseOrientationEvent),
    motion: mBuffer.map(vectoriseMotionEvent)
  }

  clearBuffers()

  ws.sendMotionAndOrientationData(data)
}
