import { Component, h } from 'preact'
import { MotionVectors, WSS } from '@app/interfaces/index'
import {
  initialiseMotionAndOrientationTracking,
  startSendLoop,
  stopSendLoop
} from '@app/orientation-and-motion'
import * as ws from '@app/websocks/ws'
import nanoid from 'nanoid'
import getLogger from '@app/log'

import twists from '@public/assets/images/twists.gif'
import shake from '@public/assets/images/shake.gif'
import circles from '@public/assets/images/circles.gif'
import triangles from '@public/assets/images/triangles.gif'
import disco from '@public/assets/images/disco.gif'
import rolls from '@public/assets/images/rolls.gif'
import floss from '@public/assets/images/floss.gif'
import { ApplicationEventTypes, emitter } from '@app/store'

const log = getLogger('training-page')
const AC = (window as any).webkitAudioContext || AudioContext

interface Gesture {
  name: string
  gif: string
  id: string
}

enum TrainingViewMode {
  CaptureList,
  CapturePrepare,
  CaptureInProgress,
  CaptureReview
}

interface TrainingViewState {
  mode: TrainingViewMode
  capturedMotionVectors: MotionVectors
  selectedGesture?: Gesture
  feedback?: WSS.IncomingFrames.MotionFeedback
}

const GESTURES: Gesture[] = shuffle([
  {
    name: 'Phone Shake',
    id: 'shake',
    gif: shake
  },
  {
    name: 'Draw a Circle',
    id: 'draw-circle',
    gif: circles
  },
  {
    name: 'Draw a Triangle',
    id: 'draw-triangle',
    gif: triangles
  },
  {
    name: 'Roll',
    id: 'roll',
    gif: rolls
  },
  {
    name: 'Night Fever',
    id: 'fever',
    gif: disco
  },
  {
    name: 'Floss',
    id: 'floss',
    gif: floss
  }
])

// Shuffle/randomise the gestures so each user gets a random list. This will help even out our training pool data since
// many users will just do the first 2 or 3. Math.random() with array.sort() isn't a reliable shuffle so we use this:
// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle (array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }

  return array
}

function getRandomGesture () {
  const idx = Math.floor(Math.random() * Math.floor(GESTURES.length))

  return GESTURES[idx]
}

export class TrainingView extends Component<{}, TrainingViewState> {
  aCtx: AudioContext | undefined

  constructor () {
    super()

    if (AC) {
      this.aCtx = new AC()
    } else {
      alert(
        'Your device does not support the Audio API. Motion capture will work, but no sounds will play.'
      )
    }

    this.setState({
      mode: TrainingViewMode.CaptureList
    })

    ws.connect().catch((err) => this.wsAlert(err))
  }

  componentWillMount () {
    // Save the motion data to a temp variable.
    // User needs to confirm it's accurate before we send it.
    initialiseMotionAndOrientationTracking((capturedMotionVectors) => {
      log('training component received motion data')
      this.setState({ capturedMotionVectors })

      ws.getTrainingFeedback({
        ...this.state.capturedMotionVectors,
        gesture: this.state.selectedGesture ? this.state.selectedGesture.id : 'unknown',
        uuid: nanoid()
      })

      emitter.once(ApplicationEventTypes.FeedbackUpdate, (feedback) => {
        this.setState({
          feedback
        })
      })
    }).catch((e) => {
      alert(
        'It looks as though this device lacks support for motion and orientation APIs/Sensors'
      )
      alert(e.toString())
    })
  }

  makeSound (duration = 100) {
    if (this.aCtx) {
      // More info at: https://odino.org/emit-a-beeping-sound-with-javascript/
      const SOUND_VOLUME = 75 // of 100 percent, decibels?

      const oscillator = this.aCtx.createOscillator()
      const gain = this.aCtx.createGain()

      oscillator.connect(gain)

      oscillator.frequency.value = 900
      oscillator.type = 'sine'

      gain.connect(this.aCtx.destination)

      gain.gain.value = SOUND_VOLUME * 0.01
      oscillator.start(this.aCtx.currentTime)
      oscillator.stop(this.aCtx.currentTime + duration / 1000)
    }
  }

  train (gesture: Gesture) {
    this.setState({
      mode: TrainingViewMode.CapturePrepare,
      selectedGesture: gesture
    })

    // Perform a countdown, after a 500ms delay
    setTimeout(() => this.makeSound(), 500)
    setTimeout(() => this.makeSound(), 1500)
    setTimeout(() => this.makeSound(), 2500)

    // And gooo!
    setTimeout(() => {
      this.makeSound(1000)
      this.setState({ mode: TrainingViewMode.CaptureInProgress })

      // Capture motion data
      startSendLoop(5500)

      // Finish the capture after ~3 seconds
      setTimeout(() => {
        stopSendLoop()
        this.makeSound()

        if (navigator.vibrate) {
          navigator.vibrate([ 250, 30, 250, 30, 250 ])
        }

        this.setState({ mode: TrainingViewMode.CaptureReview })
      }, 5500)
    }, 3500)
  }

  wsAlert (err: any) {
    log('error ion websocket')
    log(err)

    alert('WebSocket Error: Please refresh the page and try again.')
  }

  async uploadMotionData () {
    this.setState({ mode: TrainingViewMode.CaptureList })

    // Need this timeout to ensure a render() is complete after the above state change
    setTimeout(() => {
      window.location.hash = `#${getRandomGesture().id}`
    })

    if (ws.isConnected()) {
      if (!this.state.selectedGesture) {
        throw new Error(
          'selectedGesture was not set, cannot send training data'
        )
      }

      ws.saveTrainingData({
        ...this.state.capturedMotionVectors,
        gesture: this.state.selectedGesture.id,
        uuid: nanoid()
      })
    } else {
      this.wsAlert('WebSocket is not connected!')
    }
  }

  gestureFilter (g: Gesture) {
    const url = new URL(window.location.href)
    const gestures = url.searchParams.get('gestures')

    if (gestures) {
      const gArr = gestures.split(',')

      return gArr.indexOf(g.id) !== -1
    } else {
      return true
    }
  }

  render () {
    let content

    if (this.state.mode === TrainingViewMode.CaptureList) {
      const els = GESTURES.filter((g) => this.gestureFilter(g)).map((g) => {
        return (
          <div>
            <h3 id={g.id}>{g.name}</h3>
            <img
              style='border-radius: 0.5rem; border: 0.1rem solid #555; max-width: 85%;'
              src={g.gif}
              alt={g.name}
            />
            <br />
            <br />
            <button class='button-primary' onClick={() => this.train(g)}>
              Train Model
            </button>
            <hr />
          </div>
        )
      })

      content = (
        <div>
          <br />
          <h2>Gesture Model Training</h2>
          <p>
            Please select a gesture from the list below. When you select the
            gesture a series of countdown "beep" sounds begin. A longer beep
            will then sound - start doing the motion when you hear it! Keep
            going until you hear a second beep. The second beep means you're
            done and you can confirm you performed the gesture accurately, or
            try again.
          </p>
          <hr />
          {els}
        </div>
      )
    } else if (this.state.mode === TrainingViewMode.CapturePrepare) {
      content = (
        <div style='margin-top: 40vh'>
          <h2>Get Set!</h2>
        </div>
      )
    } else if (this.state.mode === TrainingViewMode.CaptureInProgress) {
      content = (
        <div style='margin-top: 40vh'>
          <h2>Go!</h2>
        </div>
      )
    } else {
      const feedback = this.state.feedback
      let feedbackEl: JSX.Element

      if (feedback) {
        feedbackEl = <pre style='text-align: left; font-size: 14px'>{JSON.stringify(feedback, null, 2)}</pre>
      } else {
        feedbackEl = <pre>Loading feedback...</pre>
      }

      content = (
        <div style='margin-top: 30vh'>
          <h2>Finished</h2>
          {feedbackEl}
          <p>
            Were you happy with the motion you made? If so, click yes to help
            train our models!
          </p>
          <button
            style='margin: 0.5rem;'
            class='button-primary'
            onClick={() => this.uploadMotionData()}
          >
            Yes
          </button>
          <button
            style='margin: 0.5rem;'
            class='button-primary'
            onClick={() =>
              this.setState({ mode: TrainingViewMode.CaptureList })
            }
          >
            No
          </button>
        </div>
      )
    }

    return (
      <div class='container' style='font-size: 13pt; text-align: center;'>
        {content}
      </div>
    )
  }
}
