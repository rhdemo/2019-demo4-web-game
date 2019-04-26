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
      captureMode: false,
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
    if (gesture) {
      this.setState({
        captureMode: true
      })
    } else {
      this.setState({
        captureMode: false
      })
    }
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

  onButtonPress (m: string) {
    setCurrentSelectedGesture(m)
  }

  render () {
    log('rendering')

    let content: JSX.Element|JSX.Element[]

    if (this.state.captureMode) {
      content = <h2 style="color: white;">Do your best {getCurrentSelectedGesture()}!</h2>
    } else {
      content = Object.keys(this.state.config.gameMotions)
        .map((m) => {
          return (
            <div class='button-container'>
              <img src={moveIconsMap[m]} onClick={() => this.onButtonPress(m)} class="stage-shadow" disabled={!this.state.config.gameMotions[m]}/>
            </div>
          )
        })
    }


    return (
      <div class='button-move-selector' style="width: 100vw; margin-top: 14vh;">
        {content}
      </div>
    )
  }
}

interface ButtonMoveSelectorState {
  config: GameConfiguration
  captureMode: boolean
}
