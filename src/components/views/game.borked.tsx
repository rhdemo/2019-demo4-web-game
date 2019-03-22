import { Component, h } from 'preact'
import { getState } from '@app/store'
import getLogger from '@app/log'

const log = getLogger('view:game.borked')

export class GameBorkedView extends Component {
  constructor() {
    super()
    log('creating')
  }
  render() {
    log('render')

    const err = getState().error

    return (
      <div class="game borked">
        <h2>GAME BORKED</h2>
        <h4>
          Sorry! If you're see this, then something isn't working the way it
          should. Here are some details:
        </h4>
        <small>{err ? err.message : 'Not sure actually...'}</small>
      </div>
    )
  }
}
