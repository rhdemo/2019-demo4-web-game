import { Component, h } from 'preact'
import nanoid from 'nanoid'
import * as ws from '@app/websocks/ws'
import { MockGestures } from '@app/interfaces/admin'

import getLogger from '@app/log'
import {ApplicationEventTypes, emitter, getState} from '@app/store'
import {ConfigGameMode, GameConfiguration, WSS} from '@app/interfaces'

const log = getLogger('admin-page')

export class AdminView extends Component<{}, AdminViewState> {
  constructor () {
    super()
    this.setState({
      config: getState().config,
      feedbackHistory: getState().feedbackHistory
    })
    this.onFeedbackUpdate = this.onFeedbackUpdate.bind(this)
  }

  async componentWillMount () {
    emitter.addListener(ApplicationEventTypes.ConfigUpdate, this.onConfigUpdate)
    emitter.addListener(ApplicationEventTypes.FeedbackUpdate, this.onFeedbackUpdate)
    return ws.connect()
  }

  onConfigUpdate = () => {
    this.setState({ config: getState().config })
  }

  onFeedbackUpdate () {
    this.setState({
      feedbackHistory: getState().feedbackHistory
    })
  }

  componentWillUnmount () {
    emitter.removeListener(
      ApplicationEventTypes.FeedbackUpdate,
      this.onFeedbackUpdate
    )
  }

  wsAlert (err: any) {
    log('error ion websocket')
    log(err)

    alert('WebSocket Error: Please refresh the page and try again.')
  }

  async uploadMotionData (gesture: string) {
    if (ws.isConnected()) {

      const { motion, orientation } = MockGestures[gesture]

      ws.sendMotionAndOrientationData({
        uuid: nanoid(),
        gesture,
        motion,
        orientation
      })
    } else {
      this.wsAlert('WebSocket is not connected!')
    }
  }

  render () {
    if (this.state.config.gameState !== ConfigGameMode.Active) {
      return (
        <div>
          <h1>Game not active!</h1>
          <h3>State: {this.state.config.gameState}</h3>
        </div>)
    }

    return (
      <div>
        <h1>Test Motions</h1>

        {Object.keys(MockGestures).map((key) => {
          return (
            <button
              style='margin: 0.5rem;'
              className='button'
              onClick={() => this.uploadMotionData(key)}
            >
              {key}
            </button>
          )
        })}

        <div>
          <pre>
            {JSON.stringify(this.state.feedbackHistory[this.state.feedbackHistory.length - 1], null, 2)}
          </pre>
        </div>
      </div>
    )
  }
}

interface AdminViewState {
  config: GameConfiguration
  feedbackHistory: WSS.IncomingFrames.MotionFeedback[]
}
