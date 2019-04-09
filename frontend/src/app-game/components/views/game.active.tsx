import { Component, h } from 'preact'
import { startSendLoop, stopSendLoop } from '@app/orientation-and-motion'
import { GameConfiguration } from '@app/interfaces'
import { ApplicationEventTypes, emitter, getState } from '@app/store'
import getLogger from '@app/log'

import GameHeaderSVG from '@public/assets/images/svg/game-header.svg'
import MachineYellowSVG from '@public/assets/images/svg/machines/yellow.svg'
import { MoveSelector } from '@app/app-game/components/move-selector'
import { machineIdToLetter } from '@app/utils';
import { MachineSvgComponent } from '../machine';

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

  onSelectedGestureChange () {
    log('perform motion loop reset due to gesture change')
    stopSendLoop()
    startSendLoop()
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

  componentDidMount () {
    log('did mount')
    const container = window.radialIndicator('#indicator-container', {
      initValue: 100,
      barColor: '#33FF66',
      radius: 30,
      fontColor: '#111',
      format: () => {
        // Must call to string or the font size gets messed up?
        return machineIdToLetter(parseInt(this.state.config.machineId))
      }
    })
  }

  render () {
    log('render')
    return (
      <div class='game active'>
        <div class='header'>
          <img src={GameHeaderSVG}/>
          <div style='color: white; text-shadow: #333 1px 1px 3px; text-transform: uppercase; font-weight: bold; padding: 1em 1.5em; flex: 1; text-align: left;'>
            <p>{this.state.config.username}</p>
          </div>
          <div style='color: white; text-shadow: #333 1px 1px 3px; text-transform: uppercase; font-weight: bold; padding: 1em 1.5em; flex: 1; text-align: right;'>
            <p>{this.state.config.score} POINTS</p>
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
