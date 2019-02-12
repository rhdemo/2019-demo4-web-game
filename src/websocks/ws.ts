import Sockette, * as sockette from 'sockette'
import { ApplicationEventTypes, emitter } from '@app/store'
import { classify, WebSocketFrames } from './message-classifier'

let sock: Sockette

export function connect () {
  if (sock) {
    return sock
  }

  sock = new Sockette(`ws://${window.location.host}`, {
    timeout: 60000,
    maxAttempts: 10,
    onopen: (e) => console.log('Connected!', e),
    onmessage: (e) => onMessage(e),
    onreconnect: (e) => console.log('Reconnecting...', e),
    onmaximum: (e) => console.log('Stop Attempting!', e),
    onclose: (e) => console.log('Closed!', e),
    onerror: (e) => console.log('Error:', e)
  })

  return sock
}

function onMessage (e: MessageEvent) {
  console.log('received socket message', e)
  const classified = classify(e.data)

  if (!classified) {
    // TODO: couldn't classify message
  } else if (WebSocketFrames.FrameType.Config === classified.type) {
    emitter.emit(ApplicationEventTypes.WebSocketEvents.Config, classified.data as WebSocketFrames.Config)
  } else if (WebSocketFrames.FrameType.Score === classified.type) {
    emitter.emit(ApplicationEventTypes.WebSocketEvents.Score, classified.data as WebSocketFrames.Score)
  } else {
    // TODO: oh noes, this shouldn't ever happen
    console.error('message was classified, but was of unknown type')
  }
}
