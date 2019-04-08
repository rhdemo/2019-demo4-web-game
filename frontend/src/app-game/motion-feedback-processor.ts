import { WSS } from '@app/interfaces'
import { getState, setToastMessage } from '@app/store'

export function processFeedback(feedback: WSS.IncomingFrames.MotionFeedback) {
  const { gestureHistory } = getState()
  const localRecord = gestureHistory.find(ge => ge.uuid === feedback.uuid)

  if (localRecord) {
    if (localRecord.gesture === feedback.gesture) {
      // Gesture was recognised!
      setToastMessage(
        `Your ${feedback.gesture} was recognised with ${Math.round(
          feedback.probability
        )}% confidence!`
      )
    } else {
      setToastMessage(
        `You attempted a ${
          localRecord.gesture
        }, but it didn't quite work. Try again!`
      )
    }
  }
}
