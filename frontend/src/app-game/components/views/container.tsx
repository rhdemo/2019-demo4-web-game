import { Component, h } from 'preact'
import { GameLoadingView } from './game.loading'
import { GameBorkedView } from './game.borked'
import { GameStoppedView } from './game.stopped'
import { GameActiveView } from './game.active'
import { GameReadyView } from './game.ready'
import { Toast } from '@app/app-game/components/toast'
import { connect } from '@app/websocks/ws'
import {
  ApplicationEventTypes,
  emitter,
  getState,
  setError,
  setGameConfiguration,
  setGameMode
} from '@app/store'
import { initialiseMotionAndOrientationTracking } from '@app/orientation-and-motion'
import { ConfigGameMode, GameConfiguration } from '@app/interfaces'
import getLogger from '@app/log'
import { DeviceUnsupportedView } from './device-unsupported'
import { getMachineColourFromId } from '@app/utils'

const log = getLogger('view:container')
const toast = <Toast></Toast>

export class ViewsContainer extends Component<{}, ViewsContainerState> {
  constructor () {
    super()

    log('creating')

    this.setState({ gameState: getState().config.gameState })
  }

  async componentWillMount () {
    log('mounting')

    emitter.on(ApplicationEventTypes.GameStateChanged, (gameState: ConfigGameMode) =>
      this.setState({ gameState })
    )

    initialiseMotionAndOrientationTracking()
      .then(() => connect())
      .then(() => setGameMode(this.state.gameState))
      .catch((err) => {
        setError(err)
        setGameConfiguration(Object.create({ gameState: ConfigGameMode.Borked }))
      })
  }

  render () {
    log('rendering')
    let v: JSX.Element

    const { gameState, machineId, playerId, score } = getState().config

    if (getState().unsupportedDevice) {
      return <DeviceUnsupportedView />
    }

    if (getState().error) {
      return <GameBorkedView />
    }

    const activeView = <GameActiveView gameState={gameState} machineId={machineId} playerId={playerId} score={score} />

    switch (gameState) {
      case ConfigGameMode.Loading:
        v = <GameLoadingView />
        break
      case ConfigGameMode.Ready:
        v = <GameReadyView />
        break
      case ConfigGameMode.Active:
        v = activeView
        break
      case ConfigGameMode.Paused:
        v = activeView
        break
      case ConfigGameMode.Stopped:
        v = <GameStoppedView/>
        break
      case ConfigGameMode.Lobby:
        v = activeView
        break
      default:
        setError(
          new Error(
            `Received unknown game state of "${gameState}"`
          )
        )
        v = <GameBorkedView />
    }

    const classname = `game-el-container machine-${getMachineColourFromId(machineId)}`

    return (
      <div class={classname}>
        {v}
        {toast}
      </div>
    )
  }
}

interface ViewsContainerState {
  gameState: ConfigGameMode
}
