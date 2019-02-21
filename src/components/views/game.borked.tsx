import { Component, h } from 'preact'
import { getState } from '@app/store'

export class GameBorkedView extends Component {
  render () {
    const err = getState().error
    return (
      <div class='game borked'>
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
