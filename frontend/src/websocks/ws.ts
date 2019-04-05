import Sockette from 'sockette'
import {
  ApplicationEventTypes,
  emitter,
  getState,
  setGameConfiguration,
  setPlayerScore
} from '@app/store'
import { WSS } from '@app/interfaces'
import getLogger from '@app/log'
import { processFeedback } from '@app/app-game/motion-feedback-processor';

const log = getLogger('wsocket')

let sock: Sockette | null = null

export function disconnect () {
  if (sock) {
    log('closing socket')
    sock.close()
    sock = null
  } else {
    log('disconnect called, but no socket exists')
  }
}

export function isConnected () {
  return sock ? true : false
}

export function connect (isAdmin = false) {
  if (sock) {
    log('already connected. returning existing socket')
    return Promise.resolve(sock)
  }

  return new Promise((resolve, reject) => {
    const url = getSocketUrl(isAdmin)

    const _sock = (sock = new Sockette(url, {
      timeout: 2500,
      onopen: (e) => {
        log('connected!', e)

        // Immediately send connection payload with playerId
        sendConnection(getState().config.playerId)

        resolve(_sock)
      },
      onmessage: (e) => onMessage(e),
      onreconnect: (e) => log('reconnecting...', e),
      onmaximum: (e) => log('reached maximum number of reconnect attempts'),
      onclose: (e) => {
        log('close event detected', e)
        if (!e.wasClean) {
          log(
            'did not close cleanly. this indicates a dropped connection. reconnection will be attempted automatically'
          )
        }
      },
      onerror: (e) => {
        log('WebSocket Error:', e)
        reject(new Error('WebSocket connection error. Please verify connection settings and refresh the page.'))
      }
    }))
  })
}

export function getSocketUrl (isAdmin = false) {
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
  const proto = window.location.protocol.includes('https') ? 'wss' : 'ws'
  return `${proto}://${window.location.hostname}${suffix}`
}

export function sendTrainingData (
    data: WSS.OutgoingFrames.MotionDataPayload
) {
  sendJsonPayload({
    type: WSS.OutgoingFrames.Type.Training,
    ...data
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
  if (sock) {
    const data = { ...payload, playerId: getState().config.playerId }
    log('sending payload', data)
    sock.json(data)
  } else {
    throw new Error('ws attempted to send data but no connection is present')
  }
}

function onMessage (e: MessageEvent) {
  log('received message', e)

  let parsed: WSS.IncomingFrames.FrameBase | undefined
  let parseErr: Error | undefined

  try {
    parsed = JSON.parse(e.data) as WSS.IncomingFrames.FrameBase
  } catch (e) {
    parseErr = e
  }

  if (!parsed || parseErr) {
    console.error('unable to parse incoming message JSON', parseErr)
  } else {
    log('parsed ws payload contains - ', parsed)

    if (WSS.IncomingFrames.Type.Config === parsed.type) {
      setGameConfiguration(parsed as WSS.IncomingFrames.Config)
    } else if (WSS.IncomingFrames.Type.Score === parsed.type) {
      setPlayerScore((parsed as WSS.IncomingFrames.Score).total)
    } else if (WSS.IncomingFrames.Type.Heartbeat === parsed.type) {
      log(`${new Date()}  - received heartbeat from server`)
      emitter.emit(ApplicationEventTypes.ServerHeartBeat)
    } else if (WSS.IncomingFrames.Type.MotionFeedback) {
      processFeedback(parsed as WSS.IncomingFrames.MotionFeedback)
    } else {
      // TODO: oh noes, this shouldn't ever happen
      console.error(`message JSON was parsed, but was of unknown type "${parsed.type}"`, e)
    }
  }
}
