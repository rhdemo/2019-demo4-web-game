import { Component, h } from 'preact'
import getLogger from '@app/log'

const log = getLogger('view:device-unsupported')

export class DeviceUnsupportedView extends Component {
  constructor () {
    super()
    log('creating')
  }
  render () {
    log('render')

    return (
      <div class='game borked'>
        <h2>SORRY!</h2>
        <h4>
          Yoy need to be using an iOS or Android device to participate in this game.
        </h4>
      </div>
    )
  }
}
