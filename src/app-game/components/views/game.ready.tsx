import { Component, h } from 'preact'
import getLogger from '@app/log'

const log = getLogger('view:game.ready')

export class GameReadyView extends Component {
  constructor() {
    super()
    log('creating')
  }
  render() {
    log('rendering')
    return (
      <div class="game ready">
        <h2>GAME READY</h2>
      </div>
    )
  }
}
