import { Component, h } from 'preact'

import MachineOne from '@public/assets/images/svg/machines/machine-1.svg'
import MachineThree from '@public/assets/images/svg/machines/machine-3.svg'
import MachineNine from '@public/assets/images/svg/machines/machine-9.svg'

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
  9: 0,
}

export class MachineSvgComponent extends Component<MachineSvgProps, {}> {

  isReversed () {
    return machineReverseMap[this.props.machineId] === 1
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
