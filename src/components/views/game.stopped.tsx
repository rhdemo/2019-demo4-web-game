import { Component, h } from 'preact'
import getLogger from '@app/log'

const log = getLogger('view:game.stopped')

export class GameStoppedView extends Component {
  constructor () {
    super()
    log('creating')
  }
  render () {
    log('rendering')
    return (
      <div class='game stopped'>
        <h2>GAME STOPPED</h2>
      </div>
    )
  }
}
