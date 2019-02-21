import Sockette from 'sockette'
import { ApplicationEventTypes, emitter } from '@app/store'
import { classify } from './message-classifier'
import { WSS } from '@app/interfaces'

let sock: Sockette

export function disconnect () {
  if (sock) {
    console.log('closing socket')
    sock.close()
  } else {
    console.warn('disconnect called, but no socket exists')
  }
}

export function connect (isAdmin = false) {
  if (sock) {
    return Promise.resolve(sock)
  }

  return new Promise((resolve, reject) => {
    const port = isAdmin ? 8082 : 8081

    // sock = new Sockette(`ws://${window.location.hostname}:${port}`, {
    sock = new Sockette(`ws://192.168.0.18:8081`, {
      timeout: 60000,
      maxAttempts: 10,
      onopen: (e) => {
        console.log('Connected!', e)
        resolve(sock)
      },
      onmessage: (e) => onMessage(e),
      onreconnect: (e) => console.log('Reconnecting...', e),
      onmaximum: (e) => console.log('Stop Attempting!', e),
      onclose: (e) => console.log('Closed!', e),
      onerror: (e) => {
        alert('wss close' + e)
        console.log('Error:', e)
        reject(e)
      }
    })
  })
}

export function sendMotionAndOrientationData (
  data: WSS.OutgoingFrames.MotionDataPayload
) {
  sendJsonPayload({
    type: WSS.OutgoingFrames.Type.Motion,
    data
  })
}

export function sendGameStateChange (
  data: WSS.OutgoingFrames.GameStateChangePayload
) {
  sendJsonPayload({
    type: WSS.OutgoingFrames.Type.GameStateChange,
    data
  })
}

function sendJsonPayload (payload: WSS.OutgoingFrames.OutgoingFrameBase) {
  sock.json(payload)
}

function onMessage (e: MessageEvent) {
  console.log('received socket message', e)
  const classified = classify(e.data)

  if (!classified) {
    // TODO: couldn't classify message
  } else if (WSS.IncomingFrames.Type.Config === classified.type) {
    emitter.emit(
      ApplicationEventTypes.ConfigUpdate,
      classified.data as WSS.IncomingFrames.Config
    )
  } else if (WSS.IncomingFrames.Type.Score === classified.type) {
    emitter.emit(
      ApplicationEventTypes.ScoreUpdate,
      classified.data as WSS.IncomingFrames.Score
    )
  } else if (WSS.IncomingFrames.Type.Heartbeat === classified.type) {
    console.log(`${new Date()}  - received heartbeat from server`)
    emitter.emit(ApplicationEventTypes.ServerHeartBeat)
  } else {
    // TODO: oh noes, this shouldn't ever happen
    console.error('message was classified, but was of unknown type')
  }
}
