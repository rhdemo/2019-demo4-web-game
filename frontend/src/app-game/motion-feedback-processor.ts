import { WSS } from '@app/interfaces'
import { setPlayerScore, setToastMessage } from '@app/store'
import { toSentence } from '@app/utils';

export function processFeedback (feedback: WSS.IncomingFrames.MotionFeedback) {
  if (feedback.correct) {
    setToastMessage({
      title: `Nice ${toSentence(feedback.gesture)}!`,
      subtitle: `${feedback.score} points`
    })
  } else {
    setToastMessage({
      title: 'Uh oh!',
      subtitle: `Try doing the ${toSentence(feedback.gesture)} again`
    })
  }

  setPlayerScore(feedback.totalScore)
}
