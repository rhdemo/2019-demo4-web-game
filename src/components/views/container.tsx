import { Component, h } from 'preact'
import { ApplicationEventTypes, emitter, state } from '@app/store'
import { WebSocketFrames } from '@app/websocks/message-classifier'
import { GameActiveView } from './game.active'
import { GamePausedView } from './game.paused'
import { GameBorkedView } from './game.borked'
import { GameStoppedView } from './game.stopped'
import { MotionAndOrientationPayload } from 'gyronorm'

export class ViewsContainer extends Component<{}, ViewsContainerState> {
  constructor () {
    super()

    this.setState({ mode: state.activeMode })
  }

  componentWillMount () {
    const onConfigEvent = (config: WebSocketFrames.Config) => {
      this.setState({ mode: config.gameState })
    }

    const onMotionEvent = (motion: MotionAndOrientationPayload) => {
      this.setState({ motion })
    }

    emitter.on(ApplicationEventTypes.OrientationMotionEvents.Update, (e) => onMotionEvent(e))
    emitter.on(ApplicationEventTypes.WebSocketEvents.Config, (e) => onConfigEvent(e))
  }

  render () {
    let v: any

    switch (this.state.mode) {
      case WebSocketFrames.ConfigGameMode.Active:
        v = <GameActiveView/>
        break
      case WebSocketFrames.ConfigGameMode.Paused:
        v = <GamePausedView/>
        break
      case WebSocketFrames.ConfigGameMode.Stopped:
        v = <GameStoppedView/>
        break
      default:
        v = <GameBorkedView/>
    }

    return (
      <div class='game-el-container'>
        {v}
      </div>
    )
  }
}

interface ViewsContainerState {
  mode: WebSocketFrames.ConfigGameMode
  motion?: MotionAndOrientationPayload
}
