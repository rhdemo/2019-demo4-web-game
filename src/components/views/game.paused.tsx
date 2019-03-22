import { Component, h } from 'preact'
import getLogger from '@app/log'

const log = getLogger('view:game.paused')

export class GamePausedView extends Component {
  constructor() {
    super()
    log('creating')
  }

  render() {
    log('rendering')
    return (
      <div class="game paused">
        <h2>It's time to</h2>
        <h1>PAUSE IT!</h1>
      </div>
    )
  }
}
