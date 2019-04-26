import { Component, h } from 'preact'
import { startSendLoop, stopSendLoop } from '@app/orientation-and-motion'
import { GameConfiguration, ConfigGameMode } from '@app/interfaces'
import { ApplicationEventTypes, emitter, getState } from '@app/store'
import { FullScreenOverlay } from '@app/app-game/components/full-screen-overlay';
import getLogger from '@app/log'

import GameHeaderSVG from '@public/assets/images/svg/header.svg'
import { MachineSvgComponent } from '@app/app-game/components/machine'
import { ButtonMoveSelector } from '@app/app-game/components/button-move-selector';

import SVGLobby from '@public/assets/images/svg/state-lobby.svg'
import SVGPause from '@public/assets/images/svg/state-pause.svg'
import SVGStopped from '@public/assets/images/svg/state-stopped.svg'

import { getMachineColourFromId } from '@app/utils';

const log = getLogger('view:game.active')

export class GameActiveView extends Component<{}, GameActiveViewState> {
  constructor () {
    super()
    log('creating')
    this.setState({
      config: getState().config
    })

    // Binding "this" for event handlers
    this.onConfigChange = this.onConfigChange.bind(this)
    this.onSelectedGestureChange = this.onSelectedGestureChange.bind(this)
  }

  onConfigChange () {
    this.setState({
      config: getState().config
    })
  }

  onSelectedGestureChange (gesture?: string) {
    log('perform motion loop reset due to gesture change')

    stopSendLoop()

    if (gesture) {
      // We only restart the send loop if gesture is defined, otherwise
      // we wait until user selects a valid gesture
      startSendLoop()
    }
  }

  componentWillMount () {
    log('will mount')
    emitter.addListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
    emitter.addListener(ApplicationEventTypes.SelectedGestureChange, this.onSelectedGestureChange)
  }

  componentWillUnmount () {
    log('will unmount')
    emitter.removeListener(
      ApplicationEventTypes.ConfigUpdate,
      this.onConfigChange
    )

    emitter.removeListener(
      ApplicationEventTypes.SelectedGestureChange,
      this.onSelectedGestureChange
    )
    stopSendLoop()
  }

  render () {
    log('render')

    const { gameState } = this.state.config
    const overlayClasses = `machine-${getMachineColourFromId(this.state.config.machineId)} ${this.state.config.gameState}`
    let overlay: JSX.Element|undefined

    if (gameState === ConfigGameMode.Lobby) {
      overlay = <FullScreenOverlay text='Game Will Begin Shortly' classes={overlayClasses} svg={SVGLobby} />
    } else if (gameState === ConfigGameMode.Paused) {
      overlay = <FullScreenOverlay text='Game Will Resume Shortly' classes={overlayClasses} svg={SVGPause} />
    } else if (gameState === ConfigGameMode.Stopped) {
      overlay = <FullScreenOverlay text='Game Over' classes={overlayClasses} svg={SVGStopped} />
    } else {
      overlay = undefined
    }

    return (
      <div class='game active'>
        <div class='header'>
          <img src={GameHeaderSVG}/>
          <div>
            <h3>{this.state.config.username}</h3>
          </div>
          <div>
            <h3>{this.state.config.score} POINTS</h3>
          </div>
        </div>

        {/* <MoveSelector/> */}
        <ButtonMoveSelector></ButtonMoveSelector>

        <MachineSvgComponent machineId={this.state.config.machineId}/>

        {overlay}
      </div>
    )
  }
}

interface GameActiveViewState {
  config: GameConfiguration
}
