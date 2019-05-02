import { Component, h } from 'preact'
import getLogger from '@app/log'
const log = getLogger('view:game.rotate')

export class GameRotateView extends Component {
  constructor () {
    super()
    log('creating')
  }
  render () {
    return (
      <div class='game rotate'>
        <h2>Please rotate your device to portrait mode.</h2>
      </div>
    )
  }
}
