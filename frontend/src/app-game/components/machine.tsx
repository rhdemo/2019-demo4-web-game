import { Component, h } from 'preact'
import { machineIdToLetter } from '@app/utils'
import { ApplicationEventTypes, emitter, getState } from '@app/store'
import { GameConfiguration } from '@app/interfaces'

import getLogger from '@app/log'

import BabyBlueMachineLightning from '@public/assets/images/svg/machines/baby-blue-machine-lightning.svg'
import BabyBlueMachine from '@public/assets/images/svg/machines/baby-blue-machine.svg'
import BlackMachine from '@public/assets/images/svg/machines/black-machine.svg'
import GreenMachine from '@public/assets/images/svg/machines/green-machine.svg'
import PinkMachine from '@public/assets/images/svg/machines/pink-machine.svg'
import PurpleMachine from '@public/assets/images/svg/machines/purple-machine.svg'
import RedMachine from '@public/assets/images/svg/machines/red-machine.svg'
import TurquoiseMachine from '@public/assets/images/svg/machines/turquoise-machine.svg'
import YellowMachine from '@public/assets/images/svg/machines/yellow-machine.svg'
import RedAltMachine from '@public/assets/images/svg/machines/red-alt-machine.svg'

const log = getLogger('component:machine')

// This is required due to the orientation of machines.
// Some need to be on the left of the screen, some right.
// 0 is left hand, 1 is right. 1 means we apply row-reverse
// flex setting in CSS
const machineReverseMap: { [key: number]: number} = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 1,
  5: 1,
  6: 1,
  7: 0,
  8: 1,
  9: 0
}

const machineSvgMap: Record<number, any> = {
  0: YellowMachine,
  1: RedMachine,
  2: TurquoiseMachine,
  3: BabyBlueMachineLightning,
  4: GreenMachine,
  5: PurpleMachine,
  6: BlackMachine,
  7: BabyBlueMachine,
  8: RedAltMachine,
  9: PinkMachine
}

export class MachineSvgComponent extends Component<MachineSvgProps, { config: GameConfiguration }> {
  private indicator: RadialIndicatorInstance<RadialIndicatorOptions> | undefined

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
      fontFamily: 'Lato',
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
    const svg = machineSvgMap[this.props.machineId]

    return (
      <div class={`machine-info-container ${this.isReversed() ? 'reverse' : ''}`}>
        <div style='flex: 0.7;' class='machine-container'>
          <img src={svg} />
        </div>

        <div style='flex: 0.3;' id='indicator-container' />
      </div>
    )
  }
}

interface MachineSvgProps {
  machineId: number
}
