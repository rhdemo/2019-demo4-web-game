import { Component, h } from 'preact'
import { MotionVectors } from '../../interfaces/index'
import {
  initialiseMotionAndOrietationTracking,
  startSendLoop
} from '@app/orientation-and-motion'
import * as ws from '@app/websocks/ws'

interface Gesture {
  name: string
  gif: string
}

enum TrainingViewMode {
  CaptureList,
  CapturePrepare,
  CaptureInProgress,
  CaptureReview
}

interface TrainingViewState {
  mode: TrainingViewMode
  data: MotionVectors
}

const GESTURES: Gesture[] = [
  {
    name: 'Night Fever',
    gif:
      'https://media0.giphy.com/media/xULW8OyTsBLHzSzFlu/giphy.gif?cid=3640f6095c7dd1433336397a36e552ab'
  },
  {
    name: 'Phone Shake',
    gif: 'https://i.gifer.com/LjZz.gif'
  },
  {
    name: 'Draw an X',
    gif: 'https://i.giphy.com/media/sPvqJVzs2HCg0/giphy.webp'
  },
  {
    name: 'Draw a Circle',
    gif:
      'https://media0.giphy.com/media/3mhQzhl6YyQ3bKIL29/giphy.gif?cid=3640f6095c7dd1aa4f7852704d138bfe'
  }
]

export class TrainingView extends Component<{}, TrainingViewState> {
  constructor () {
    super()

    this.setState({
      mode: TrainingViewMode.CaptureList
    })
  }

  componentWillMount () {
    // Save the motion data to a temp variable.
    // User needs to confirm it's accurate before we send it.
    initialiseMotionAndOrietationTracking((data) => this.setState({ data }))
  }

  makeSound (duration = 100) {
    // More info at: https://odino.org/emit-a-beeping-sound-with-javascript/
    const aCtx = new AudioContext()
    const SOUND_VOLUME = 75 // of 100 percent, decibels?

    const oscillator = aCtx.createOscillator()
    const gain = aCtx.createGain()

    oscillator.connect(gain)

    oscillator.frequency.value = 900
    oscillator.type = 'sine'

    gain.connect(aCtx.destination)

    gain.gain.value = SOUND_VOLUME * 0.01
    oscillator.start(aCtx.currentTime)
    oscillator.stop(aCtx.currentTime + duration / 1000)
  }

  train (gesture: Gesture) {
    this.setState({
      mode: TrainingViewMode.CapturePrepare
    })

    // Perform a countdown, after a 500ms delay
    setTimeout(() => this.makeSound(), 500)
    setTimeout(() => this.makeSound(), 1500)
    setTimeout(() => this.makeSound(), 2500)

    // Gooo!
    setTimeout(() => {
      this.makeSound(1000)
      this.setState({ mode: TrainingViewMode.CaptureInProgress })

      // Capture motion data
      startSendLoop(3500)

      // Finish the capture after ~3 seconds
      setTimeout(() => {
        this.makeSound()

        if (navigator.vibrate) {
          navigator.vibrate([ 250, 30, 250, 30, 250 ])
        }

        this.setState({ mode: TrainingViewMode.CaptureReview })
      }, 3500)
    }, 3500)
  }

  async uploadMotionData () {
    this.setState({ mode: TrainingViewMode.CaptureList })

    ws.connect()
      .then(() => ws.sendMotionAndOrientationData(this.state.data))
      .then(() => ws.disconnect())
      .catch(() => alert('Failed to upload motion data'))
  }

  render () {
    let content

    if (this.state.mode === TrainingViewMode.CaptureList) {
      const els = GESTURES.map((g) => {
        return (
          <div>
            <h3>{g.name}</h3>
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
      content = (
        <div style='margin-top: 30vh'>
          <h2>Finished</h2>
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
