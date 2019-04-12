import { Component, h } from 'preact'
import { machineIdToLetter } from '@app/utils'
import { ApplicationEventTypes, emitter, getState } from '@app/store'
import { GameConfiguration } from '@app/interfaces'

import getLogger from '@app/log'
import MachineOne from '@public/assets/images/svg/machines/machine-1.svg'
import MachineThree from '@public/assets/images/svg/machines/machine-3.svg'
import MachineNine from '@public/assets/images/svg/machines/machine-9.svg'


const log = getLogger('component:machine')

// Maps machine orientation, 0 is left hand, 1 is right
// 1 means we apply row-reverse flex setting in CSS
const machineReverseMap: { [key: number]: number} = {
  1: 0,
  2: 0,
  3: 1,
  4: 1,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0
}

export class MachineSvgComponent extends Component<MachineSvgProps, { config: GameConfiguration }> {
  private indicator: RadialIndicatorInstance<RadialIndicatorOptions>|undefined

  constructor () {
    log('create')
    super()

    this.setState({
      config: getState().config
    })

    this.onConfigChange = this.onConfigChange.bind(this)
  }

  onConfigChange () {
    log('config change detected')
    this.setState({
      config: getState().config
    })

    if (this.indicator) {
      const health = this.state.config.machineHealth

      log('update indicator with health value:', health)

      this.indicator.value(health)
    }
  }

  isReversed () {
    return machineReverseMap[this.props.machineId] === 1
  }

  componentDidMount () {
    this.indicator = window.radialIndicator('#indicator-container', {
      initValue: 100,
      barColor: '#33FF66',
      radius: 30,
      fontColor: '#111',
      format: () => {
        // Must call to string or the font size gets messed up?
        return machineIdToLetter(this.state.config.machineId)
      }
    })
  }

  componentWillMount () {
    emitter.addListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
  }

  componentWillUnmount () {
    emitter.removeListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
  }

  render () {
    let svg: any

    switch (this.props.machineId) {
      case 1:
        svg = MachineOne
        break
      case 3:
        svg = MachineThree
        break
      case 9:
        svg = MachineNine
        break
      default:
        svg = MachineOne
    }

    return (
      <div class={`machine-info-container ${this.isReversed() ? 'reverse' : ''}`}>
        <div style='flex: 0.65;' class='machine-container'>
          <img src={svg} />
        </div>

        <div style='flex: 0.35;' id='indicator-container' />
      </div>
    )
  }
}

interface MachineSvgProps {
  machineId: number
}
