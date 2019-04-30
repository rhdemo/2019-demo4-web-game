import { Component, h } from 'preact'
import getLogger from '@app/log'
import { GameConfiguration, MotionVectors } from '@app/interfaces'
import { ApplicationEventTypes, emitter, getCurrentSelectedGesture, getState, setCurrentSelectedGesture } from '@app/store'

import IconCircle from '@public/assets/images/svg/moves/icon-circle.svg'
import IconFever from '@public/assets/images/svg/moves/icon-fever.svg'
import IconFloss from '@public/assets/images/svg/moves/icon-floss.svg'
import IconRoll from '@public/assets/images/svg/moves/icon-roll.svg'
import IconShake from '@public/assets/images/svg/moves/icon-shake.svg'
import IconX from '@public/assets/images/svg/moves/icon-x.svg'

const moveIconsMap: { [key: string]: any} = {
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
    this.onMotionUpdate = this.onMotionUpdate.bind(this)
    this.onGestureChange = this.onGestureChange.bind(this)
  }

  onConfigChange () {
    this.setState({ config: getState().config })
  }

  onGestureChange (gesture?: string) {
    this.forceUpdate()
  }

  onMotionUpdate (data: MotionVectors) {
    // Unset the selected gesture, probably could better centralise this logic
    setCurrentSelectedGesture(undefined)
  }

  componentWillMount () {
    log('will mount')

    emitter.addListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
    emitter.addListener(ApplicationEventTypes.SelectedGestureChange, this.onGestureChange)
    emitter.addListener(ApplicationEventTypes.MotionUpdate, this.onMotionUpdate)
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
    const content = Object.keys(this.state.config.gameMotions)
      .map((m) => {
        let style = ``
        const isEnabled = this.state.config.gameMotions[m]
        const isSelected = m === selectedGesture

        if (isEnabled) {
          style = `background-image: url(${moveIconsMap[m]});`
        } else {
          style = `border: 0.1em white dashed;  background-color: transparent;`
        }

        return (
          <div onClick={() => this.onButtonPress(m, isEnabled)} class={`button-container stage-shadow ${isSelected ? 'selected' : ''}`} disabled={!isEnabled} style={style}>
            {isEnabled ? <h3>{m}</h3> : <h3>&nbsp;</h3>}
          </div>
        )
      })

    return (
      <div class='button-move-selector' style='width: 100vw; margin-top: 14vh;'>
        <h2>CHOOSE A MOTION</h2>
        {content}
      </div>
    )
  }
}

interface ButtonMoveSelectorState {
  config: GameConfiguration
}
