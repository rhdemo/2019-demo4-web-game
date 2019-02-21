import { Component, h } from 'preact'
import { startSendLoop, stopSendLoop } from '@app/orientation-and-motion'

export class GameActiveView extends Component {
  componentWillMount () {
    startSendLoop()
  }

  componentWillUnmount () {
    stopSendLoop()
  }

  render () {
    return (
      <div class='game active'>
        <h2>GAME ACTIVE</h2>
      </div>
    )
  }
}
