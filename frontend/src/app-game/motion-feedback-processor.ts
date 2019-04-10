import { WSS } from '@app/interfaces'
import { setToastMessage } from '@app/store'

export function processFeedback (feedback: WSS.IncomingFrames.MotionFeedback) {
  if (feedback.correct) {
    setToastMessage(`Your ${feedback.gesture} was recognised successfully!`)
  } else {
    setToastMessage(
      `You attempted a ${feedback.gesture}, but it wasn't quite right. Try again!`
    )
  }
}
