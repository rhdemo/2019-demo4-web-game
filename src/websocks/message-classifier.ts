import { GameConfiguration, WSS } from '@app/interfaces'

/**
 * Classifies incoming frames and wraps them in a ClassifiedFrame Object with
 * their given type classification and original payload
 * @param payload
 */
export function classify (
  payload: string
): WSS.IncomingFrames.ClassifiedFrame | null {
  try {
    const parsed = JSON.parse(payload) as WSS.IncomingFrames.FrameBase

    if (parsed.type === WSS.IncomingFrames.Type.Config) {
      return {
        type: WSS.IncomingFrames.Type.Config,
        data: parsed as WSS.IncomingFrames.Config
      }
    } else if (parsed.type === WSS.IncomingFrames.Type.Score) {
      return {
        type: WSS.IncomingFrames.Type.Score,
        data: parsed as WSS.IncomingFrames.Score
      }
    } else if (parsed.type === WSS.IncomingFrames.Type.Heartbeat) {
      return {
        type: WSS.IncomingFrames.Type.Heartbeat,
        data: {} as WSS.IncomingFrames.Heartbeat
      }
    } else {
      return null
    }
  } catch (e) {
    console.error('received malformed message from wss')
    console.error(payload)

    return null
  }
}
