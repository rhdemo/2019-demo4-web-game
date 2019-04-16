import { Component, h } from 'preact'
import { startSendLoop, stopSendLoop } from '@app/orientation-and-motion'
import { GameConfiguration } from '@app/interfaces'
import { ApplicationEventTypes, emitter, getState } from '@app/store'
import getLogger from '@app/log'

import GameHeaderSVG from '@public/assets/images/svg/header.svg'
import { MoveSelector } from '@app/app-game/components/move-selector'
import { MachineSvgComponent } from '../machine'

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
    startSendLoop()
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
    return (
      <div class='game active'>
        <div class='header'>
          <img src={GameHeaderSVG}/>
          <div style='color: white; text-shadow: #333 1px 1px 3px; text-transform: uppercase; font-weight: bold; padding: 1em 1.5em; flex: 1; text-align: left;'>
            <h3>{this.state.config.username}</h3>
          </div>
          <div style='color: white; text-shadow: #333 1px 1px 3px; text-transform: uppercase; font-weight: bold; padding: 1em 1.5em; flex: 1; text-align: right;'>
            <h3>{this.state.config.score} POINTS</h3>
          </div>
        </div>

        <MoveSelector/>

        <MachineSvgComponent machineId={this.state.config.machineId}/>
      </div>
    )
  }
}

interface GameActiveViewState {
  config: GameConfiguration
}
