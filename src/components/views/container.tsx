import { GameLoadingView } from './game.loading'
import { Component, h } from 'preact'
import { GamePausedView } from './game.paused'
import { GameBorkedView } from './game.borked'
import { GameStoppedView } from './game.stopped'
import { GameActiveView } from './game.active'
import { GameReadyView } from './game.ready'
import { connect } from '@app/websocks/ws'
import {
  ApplicationEventTypes,
  emitter,
  getState,
  setError,
  setGameConfiguration
} from '@app/store'
import { initialiseMotionAndOrietationTracking } from '@app/orientation-and-motion'
import { ConfigGameMode, GameConfiguration } from '@app/interfaces'

export class ViewsContainer extends Component<{}, ViewsContainerState> {
  constructor () {
    super()

    this.setState({ config: getState().config })
  }

  async componentWillMount () {
    const onConfigChange = (config: GameConfiguration) => {
      this.setState({ config })
    }

    emitter.on(ApplicationEventTypes.ConfigUpdate, (config) =>
      onConfigChange(config)
    )

    initialiseMotionAndOrietationTracking()
      .then(() => connect())
      .then(() => setGameConfiguration({ gameState: ConfigGameMode.Ready }))
      .catch((err) => {
        setError(err)
        setGameConfiguration({ gameState: ConfigGameMode.Borked })
      })
  }

  render () {
    let v: any

    switch (this.state.config.gameState) {
      case ConfigGameMode.Loading:
        v = <GameLoadingView />
        break
      case ConfigGameMode.Ready:
        v = <GameReadyView />
        break
      case ConfigGameMode.Active:
        v = <GameActiveView />
        break
      case ConfigGameMode.Paused:
        v = <GamePausedView />
        break
      case ConfigGameMode.Stopped:
        v = <GameStoppedView />
        break
      default:
        v = <GameBorkedView />
    }

    return <div class='game-el-container'>{v}</div>
  }
}

interface ViewsContainerState {
  config: GameConfiguration
}
