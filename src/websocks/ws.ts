import Sockette from 'sockette'
import {
  ApplicationEventTypes,
  emitter,
  getState,
  setGameConfiguration,
} from '@app/store'
import { classify } from './message-classifier'
import { WSS } from '@app/interfaces'
import getLogger from '@app/log'

const log = getLogger('wsocket')

let sock: Sockette | null = null

export function disconnect() {
  if (sock) {
    log('closing socket')
    sock.close()
    sock = null
  } else {
    log('disconnect called, but no socket exists')
  }
}

export function isConnected() {
  return sock ? true : false
}

export function connect(isAdmin = false) {
  if (sock) {
    log('already connected. returning existing socket')
    return Promise.resolve(sock)
  }

  return new Promise((resolve, reject) => {
    const url = getSocketUrl(isAdmin)

    const _sock = (sock = new Sockette(url, {
      timeout: 2500,
      onopen: e => {
        log('connected!', e)

        // Immediately send connection payload with playerId
        sendConnection(getState().config.playerId)

        resolve(_sock)
      },
      onmessage: e => onMessage(e),
      onreconnect: e => log('reconnecting...', e),
      onmaximum: e => log('reached maximum number of reconnect attempts'),
      onclose: e => {
        log('close event detected', e)
        if (!e.wasClean) {
          log(
            'did not close cleanly. this indicates a dropped connection. reconnection will be attempted automatically'
          )
        }
      },
      onerror: e => {
        log('WebSocket Error:', e)
        reject(e)
      },
    }))
  })
}

function getSocketUrl(isAdmin = false) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const devGameSocket = process.env.GAME_SOCKET
  const devAdminSocket = process.env.ADMIN_SOCKET

  if (isDevelopment && isAdmin && devAdminSocket) {
    return devAdminSocket
  }

  if (isDevelopment && !isAdmin && devGameSocket) {
    return devGameSocket
  }

  const suffix = isAdmin ? '/admin-socket' : '/game-socket'
  return `ws://${window.location.hostname}${suffix}`
}

export function sendMotionAndOrientationData(
  data: WSS.OutgoingFrames.MotionDataPayload
) {
  sendJsonPayload({
    type: WSS.OutgoingFrames.Type.Motion,
    ...data,
  })
}

export function sendGameStateChange(
  data: WSS.OutgoingFrames.GameStateChangePayload
) {
  sendJsonPayload({
    type: WSS.OutgoingFrames.Type.GameStateChange,
    ...data,
  })
}

export function sendConnection(playerId?: string) {
  sendJsonPayload({
    type: WSS.OutgoingFrames.Type.Connection,
    playerId,
  })
}

function sendJsonPayload(payload: WSS.OutgoingFrames.OutgoingFrame) {
  if (sock) {
    sock.json({ ...payload, playerId: getState().config.playerId })
  } else {
    throw new Error('ws attempted to send data but no connection is present')
  }
}

function onMessage(e: MessageEvent) {
  log('received message', e)
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
