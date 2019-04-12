import { WSS } from '@app/interfaces'
import { setToastMessage, setPlayerScore } from '@app/store'

export function processFeedback (feedback: WSS.IncomingFrames.MotionFeedback) {
  console.log('processing feedback', feedback)
  if (feedback.correct) {
    setToastMessage(`Your ${feedback.gesture} was recognised successfully!`)
  } else {
    setToastMessage(
      `You attempted a ${feedback.gesture}, but it wasn't quite right. Try again!`
    )
  }

  setPlayerScore(feedback.totalScore)
}
