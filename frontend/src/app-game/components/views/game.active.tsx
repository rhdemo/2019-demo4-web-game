import { Component, h } from 'preact'
import { startSendLoop, stopSendLoop } from '@app/orientation-and-motion'
import { ConfigGameMode, GameConfiguration } from '@app/interfaces'
import { ApplicationEventTypes, emitter, getState, getCurrentSelectedGesture } from '@app/store'
import { FullScreenOverlay } from '@app/app-game/components/full-screen-overlay'
import getLogger from '@app/log'

import GameHeaderSVG from '@public/assets/images/svg/header.svg'
import { MachineSvgComponent } from '@app/app-game/components/machine'
import { ButtonMoveSelector } from '@app/app-game/components/button-move-selector'

import SVGLobby from '@public/assets/images/svg/state-lobby.svg'
import SVGPause from '@public/assets/images/svg/state-pause.svg'

import { getMachineColourFromId } from '@app/utils'

const log = getLogger('view:game.active')

const moveTextMap: Record<string, string> = {
  'circle': 'Draw a Circle',
  'fever': 'Do the Fever',
  'floss': 'Do the Floss',
  'roll': 'Roll your Phone',
  'shake': 'Shake your Phone',
  'x': 'Draw an X'
}

export class GameActiveView extends Component<GameActiveViewProps, GameActiveViewState> {
  constructor (props: GameActiveViewProps) {
    super()
    log('creating')
    this.setState({
      score: props.score,
      selectedGesture: getCurrentSelectedGesture()
    })

    // Binding "this" for event handlers
    this.onScoreChange = this.onScoreChange.bind(this)
    this.onSelectedGestureChange = this.onSelectedGestureChange.bind(this)
  }

  onScoreChange (score: number) {
    this.setState({
      score
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

    this.setState({ selectedGesture: gesture })
  }

  componentWillMount () {
    log('will mount')
    emitter.addListener(ApplicationEventTypes.Score, this.onScoreChange)
    emitter.addListener(ApplicationEventTypes.SelectedGestureChange, this.onSelectedGestureChange)
  }

  componentWillUnmount () {
    log('will unmount')
    emitter.removeListener(
      ApplicationEventTypes.Score,
      this.onScoreChange
    )

    emitter.removeListener(
      ApplicationEventTypes.SelectedGestureChange,
      this.onSelectedGestureChange
    )
    stopSendLoop()
  }

  render () {
    log('render')

    const { gameState, playerId, machineId } = this.props
    const gesture = this.state.selectedGesture
    const overlayClasses = `machine-${getMachineColourFromId(machineId)} ${gameState}`
    let overlay: JSX.Element | undefined

    if (gameState === ConfigGameMode.Lobby) {
      overlay = <FullScreenOverlay text='Game Will Begin Shortly' classes={overlayClasses} svg={SVGLobby} />
    } else if (gameState === ConfigGameMode.Paused) {
      overlay = <FullScreenOverlay text='Game Will Resume Shortly' classes={overlayClasses} svg={SVGPause} />
    } else {
      overlay = undefined
    }

    return (
      <div class='game active'>
        <div class='header' style={`background-image:url(${GameHeaderSVG})`}>
          <div class='header-player'>
            <h3>{playerId}</h3>
          </div>
          <div class='header-score'>
            <h3>{this.state.score} points</h3>
          </div>
          <h2 class="header-title motion-heading">
            { gesture ? moveTextMap[gesture] : 'choose a motion' }
          </h2>
        </div>

        <ButtonMoveSelector></ButtonMoveSelector>

        <MachineSvgComponent machineId={machineId}/>

        {overlay}
      </div>
    )
  }
}

interface GameActiveViewState {
  score: number
  selectedGesture?: string
}

interface GameActiveViewProps {
  score: number
  machineId: number
  playerId: string
  gameState: ConfigGameMode
}
