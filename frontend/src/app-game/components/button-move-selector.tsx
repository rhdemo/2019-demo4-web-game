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

import IconCircle from '@public/assets/images/svg/moves/icon-circle.svg'
import IconFever from '@public/assets/images/svg/moves/icon-fever.svg'
import IconFloss from '@public/assets/images/svg/moves/icon-floss.svg'
import IconRoll from '@public/assets/images/svg/moves/icon-roll.svg'
import IconShake from '@public/assets/images/svg/moves/icon-shake.svg'
import IconX from '@public/assets/images/svg/moves/icon-x.svg'
import { toSentence } from '@app/utils'

const moveIconsMap: { [key: string]: string } = {
  'circle': IconCircle,
  'fever': IconFever,
  'floss': IconFloss,
  'roll': IconRoll,
  'shake': IconShake,
  'x': IconX
}

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
        let imageTag: JSX.Element | undefined
        const isEnabled = this.state.config.gameMotions[m]
        const isSelected = m === selectedGesture

        if (isEnabled) {
          imageTag = <img src={moveIconsMap[m]}/>
        }

        return (
          <div
            onClick={() => this.onButtonPress(m, isEnabled)}
            class={`button-container stage-shadow ${isSelected ? 'selected' : ''}`}
            disabled={!isEnabled}
          >
            {isEnabled ? <h3>{toSentence(m)}</h3> : <h3>&nbsp;</h3>}
            {imageTag}
          </div>
        )
      })

    return (
      <div class='button-move-selector'>
        <h2>CHOOSE A MOTION</h2>
        <div>
          {buttons}
        </div>
      </div>
    )
  }
}

interface ButtonMoveSelectorState {
  config: GameConfiguration
}
