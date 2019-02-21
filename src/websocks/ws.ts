import Sockette from 'sockette'
import {
  ApplicationEventTypes,
  emitter,
  setGameConfiguration
} from '@app/store'
import { classify } from './message-classifier'
import { WSS } from '@app/interfaces'
import getLogger from '@app/log'

const log = getLogger('ws')

let sock: Sockette

export function disconnect () {
  if (sock) {
    log('closing socket')
    sock.close()
  } else {
    log('disconnect called, but no socket exists')
  }
}

export function connect (isAdmin = false) {
  if (sock) {
    log('already connected. returning existing socket')
    return Promise.resolve(sock)
  }

  return new Promise((resolve, reject) => {
    const suffix = isAdmin ? '/admin-socket' : '/game-socket'
    const url = `ws://${window.location.hostname}${suffix}`

    sock = new Sockette(url, {
      timeout: 60000,
      maxAttempts: 10,
      onopen: (e) => {
        log('Connected!', e)
        resolve(sock)
      },
      onmessage: (e) => onMessage(e),
      onreconnect: (e) => log('Reconnecting...', e),
      onmaximum: (e) => log('Stop Attempting!', e),
      onclose: (e) => log('Closed!', e),
      onerror: (e) => {
        alert('wss close' + e)
        log('Error:', e)
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
    ...data
  })
}

export function sendGameStateChange (
  data: WSS.OutgoingFrames.GameStateChangePayload
) {
  sendJsonPayload({
    type: WSS.OutgoingFrames.Type.GameStateChange,
    ...data
  })
}

export function sendConnection (playerId?: string) {
  sendJsonPayload({
    type: WSS.OutgoingFrames.Type.Connection,
    playerId
  })
}

function sendJsonPayload (payload: WSS.OutgoingFrames.OutgoingFrame) {
  sock.json(payload)
}

function onMessage (e: MessageEvent) {
  log('received socket message', e)
  const classified = classify(e.data)

  if (!classified) {
    // TODO: couldn't classify message
    console.error('unable to classify incoming message:', e)
  } else if (WSS.IncomingFrames.Type.Config === classified.type) {
    setGameConfiguration(classified.data as WSS.IncomingFrames.Config)
  } else if (WSS.IncomingFrames.Type.Score === classified.type) {
    emitter.emit(
      ApplicationEventTypes.ScoreUpdate,
      classified.data as WSS.IncomingFrames.Score
    )
  } else if (WSS.IncomingFrames.Type.Heartbeat === classified.type) {
    log(`${new Date()}  - received heartbeat from server`)
    emitter.emit(ApplicationEventTypes.ServerHeartBeat)
  } else {
    // TODO: oh noes, this shouldn't ever happen
    console.error('message was classified, but was of unknown type')
  }
}
