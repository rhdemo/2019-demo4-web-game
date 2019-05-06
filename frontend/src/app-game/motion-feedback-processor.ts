import { WSS } from '@app/interfaces'
import { setPlayerScore, setToastMessage, setGameConfiguration, getState } from '@app/store'
import { toSentence } from '@app/utils'
import { Howl, Howler } from 'howler'

import ScoreSoundWAV from '@public/assets/smb2-grow.wav'

const scoreSound = (window as any).scoreSound = new Howl({
  src: [ ScoreSoundWAV ],
  autoplay: false,
  loop: false,
  volume: 0.75
})

export function processFeedback (feedback: WSS.IncomingFrames.MotionFeedback) {
  if (feedback.correct) {
    if (feedback.bonus > 0) {
      setToastMessage({
        star: true,
        title: `All Moves Bonus!`,
        subtitle: `${feedback.bonus} points`
      })
      setTimeout(() => scoreSound.play())
    } else {
      setToastMessage({
        star: true,
        title: `Nice ${toSentence(feedback.gesture)}!`,
        subtitle: `${feedback.score} points`
      })
    }

    const cfg = getState().config

    // Locally increment gesture. On refresh or gameState change we'll
    // get the correct gesture amount from the server, but need to be at
    // least 1 or more to show stars above moves that are completed
    cfg.successfulMotions[feedback.gesture] += 1

    setGameConfiguration(cfg)
  } else {
    setToastMessage({
      star: false,
      title: 'Uh oh!',
      subtitle: `Try doing the ${toSentence(feedback.gesture)} again`
    })
  }

  setPlayerScore(feedback.totalScore)
}

(window as any).feedback = processFeedback
