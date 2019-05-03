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
import { getMachineColourFromId, isInPortraitOrientation } from '@app/utils'
import { GameRotateView } from './game.rotate';

const log = getLogger('view:container')
const toast = <Toast></Toast>

export class ViewsContainer extends Component<{}, ViewsContainerState> {
  constructor () {
    super()

    log('creating')

    this.setState({
      gameState: getState().config.gameState,
      requiresRotation: isInPortraitOrientation() ? false : true
    })

    // Yes, I hate this too, but we need to ensure the UI reflows correctly,
    // and due to the animations performed by various mobile OSes upon
    // rotation we can't accurately detrmine when the animation ends, so
    // we just keep calling this instead
    setInterval(() => this.resetHeight(), 100)
    window.addEventListener('orientationchange',  (ev) => {
      const orientation = window.orientation

      if (typeof orientation === 'number') {
        this.setState({
          requiresRotation: orientation !== 0 && orientation !== 180
        })
      }
    })
  }

  resetHeight () {
    // On iOS and Android the address/menu bars overlay content. Visually this
    // is not appealing. Constraing the content area within window.innerHeight
    const mountNode = document.getElementById('root') as HTMLElement
    mountNode.style.height = `${window.innerHeight}px`
  }

  componentWillMount () {
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
        <div style={`height: 100%; display: ${this.state.requiresRotation ? 'none;' : 'inherit;'}`}>
          {v}
          {toast}
        </div>

        {/* This will overlay all other content until user returns to portrait */}
        {this.state.requiresRotation ? <GameRotateView /> : undefined}
      </div>
    )
  }
}

interface ViewsContainerState {
  gameState: ConfigGameMode
  requiresRotation: boolean
}
