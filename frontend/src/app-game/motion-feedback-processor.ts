import { WSS } from '@app/interfaces'
import { setPlayerScore, setToastMessage } from '@app/store'
import { toSentence } from '@app/utils'
import { Howl, Howler } from 'howler';

// import ScoreSoundWAV from '@public/assets/sonic-spinner.wav'
import ScoreSoundWAV from '@public/assets/smb2-grow.wav'


const scoreSound = (window as any).scoreSound = new Howl({
  src: [ScoreSoundWAV],
  autoplay: false,
  loop: false,
  volume: 0.75
});

export function processFeedback (feedback: WSS.IncomingFrames.MotionFeedback) {
  if (feedback.correct && feedback.bonus > 0) {
    setToastMessage({
      title: `All Moves Bonus!`,
      subtitle: `${feedback.bonus} points`
    })
    setTimeout(() => scoreSound.play())
  } else if (feedback.correct) {
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
