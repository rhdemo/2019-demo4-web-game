import { Component, h } from 'preact'
import getLogger from '@app/log'
import { ConfigGameMode, GameConfiguration } from '@app/interfaces'
import {
  ApplicationEventTypes,
  emitter,
  getCurrentSelectedGesture,
  getState,
  setCurrentSelectedGesture
} from '@app/store'

import { toSentence } from '@app/utils'
import StarSVG from '@assets/images/svg/star.svg'
import MoveSvg from './svgs/moves'

const log = getLogger('component:button-move-selector')

export class ButtonMoveSelector extends Component<{}, ButtonMoveSelectorState> {
  constructor () {
    log('creating')

    super()

    this.setState({
      config: getState().config
    })

    this.onConfigChange = this.onConfigChange.bind(this)
    this.onGestureChange = this.onGestureChange.bind(this)
  }

  onConfigChange () {
    const state = getState()
    const selectedGesture = getCurrentSelectedGesture()

    this.setState({ config: state.config })

    if (selectedGesture && state.config.gameState !== ConfigGameMode.Active) {
      // If the game is inactive then deselect gesture
      setCurrentSelectedGesture(undefined)
    }
  }

  onGestureChange (gesture?: string) {
    this.forceUpdate()
  }

  componentWillMount () {
    log('will mount')

    emitter.addListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
    emitter.addListener(ApplicationEventTypes.SelectedGestureChange, this.onGestureChange)
  }

  componentWillUnmount () {
    log('will unmount')

    emitter.removeListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
  }

  getEnabledMotionKeys () {
    return Object.keys(this.state.config.gameMotions)
      .filter((m) => this.state.config.gameMotions[m])
  }

  getCurrentMoveIdx () {
    const selection = getCurrentSelectedGesture() || this.getEnabledMotionKeys()[0]

    return this.getEnabledMotionKeys().indexOf(selection)
  }

  onButtonPress (m: string, isEnabled: boolean) {
    if (!isEnabled) {
      log('attempted to select inactive motion. skipping')
      return
    }

    log(`setting selected motion to "${m}"`)
    setCurrentSelectedGesture(m)
  }

  render () {
    log('rendering')

    const selectedGesture = getCurrentSelectedGesture()
    const buttons = Object.keys(this.state.config.gameMotions)
      .map((m) => {
        let moveSvg: JSX.Element | undefined
        const isEnabled = this.state.config.gameMotions[m]
        const isSelected = m === selectedGesture

        if (isEnabled) {
          moveSvg = <MoveSvg move={m} />
        }

        return (
          <div
            onClick={() => this.onButtonPress(m, isEnabled)}
            class={`button-container stage-shadow ${isSelected ? 'selected' : ''}`}
            disabled={!isEnabled}
          >
            {/* Star is visible if user has completed that move at least once */}
            <div class={`star ${this.state.config.successfulMotions[m] === 0 ? 'hidden' : ''}`}>
              <img src={StarSVG}/>
            </div>
            {isEnabled ? <h3>{toSentence(m)}</h3> : <h3>&nbsp;</h3>}
            {moveSvg}
          </div>
        )
      })

    return (
      <div class='button-move-selector'>
        <div class='button-wrapper'>
          {buttons}
        </div>
      </div>
    )
  }
}

interface ButtonMoveSelectorState {
  config: GameConfiguration
}
