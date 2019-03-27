import { GameLoadingView } from './game.loading'
import { Component, h } from 'preact'
import { GamePausedView } from './game.paused'
import { GameBorkedView } from './game.borked'
import { GameStoppedView } from './game.stopped'
import { GameActiveView } from './game.active'
import { GameReadyView } from './game.ready'
import { GameLobbyView } from './game.lobby'
import { connect } from '@app/websocks/ws'
import {
  ApplicationEventTypes,
  emitter,
  getState,
  setError,
  setGameConfiguration,
  setGameMode
} from '@app/store'
import { initialiseMotionAndOrietationTracking } from '@app/orientation-and-motion'
import { ConfigGameMode, GameConfiguration } from '@app/interfaces'
import getLogger from '@app/log'
import { DeviceUnsupportedView } from './device-unsupported';

const log = getLogger('view:container')

export class ViewsContainer extends Component<{}, ViewsContainerState> {
  constructor () {
    super()

    log('creating')
    this.setState({ config: getState().config })
  }

  async componentWillMount () {
    log('mounting')
    const onConfigChange = () => {
      this.setState({ config: getState().config })
    }

    emitter.on(ApplicationEventTypes.ConfigUpdate, () =>
      onConfigChange()
    )

    initialiseMotionAndOrietationTracking()
      .then(() => connect())
      .then(() => setGameMode(ConfigGameMode.Ready))
      .catch((err) => {
        setError(err)
        setGameConfiguration(Object.create({ gameState: ConfigGameMode.Borked }))
      })
  }

  render () {
    log('rendering')
    let v: JSX.Element

    if (getState().error) {
      return <GameBorkedView />
    }

    if (getState().unsupportedDevice) {
      return <DeviceUnsupportedView />
    }

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
      case ConfigGameMode.Lobby:
        v = <GameLobbyView />
        break
      default:
        setError(
          new Error(
            `Received unknown game state of "${this.state.config.gameState}"`
          )
        )
        v = <GameBorkedView />
    }

    return <div class='game-el-container'>{v}</div>
  }
}

interface ViewsContainerState {
  config: GameConfiguration
  playerId: string
}
