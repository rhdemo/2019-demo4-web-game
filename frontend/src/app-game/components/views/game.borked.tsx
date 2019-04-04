import { Component, h } from 'preact'
import { getState } from '@app/store'
import getLogger from '@app/log'
import { DeviceMotionUnavailableError } from '@app/orientation-and-motion'
import { isAppleTwelveDevice } from '@app/utils'

const log = getLogger('view:game.borked')

export class GameBorkedView extends Component {
  constructor () {
    super()
    log('creating')
  }
  render () {
    log('render')

    const err = getState().error

    if (err instanceof DeviceMotionUnavailableError && isAppleTwelveDevice()) {
      return (
        <div class='game borked'>
          <h2>
            HEY THERE!
          </h2>

          <div style='text-align: left;'>
            <p>
              Looks like you're using iOS 12. You'll need to make a quick settings change to play this game on your device.
            </p>
            <ol>
              <li>Open your Settings application</li>
              <li>Navigate to <i>Safari > Motion & Orientation Access</i></li>
              <li>Enable the setting</li>
              <li>Refresh this page after doing so and you'll be able to play!</li>
            </ol>
          </div>
        </div>
      )
    }

    return (
      <div class='game borked'>
        <h2>GAME BORKED</h2>
        <p>
          Sorry! If you're see this, then something isn't working the way it
          should.
        </p>
        <p>Here are some details:</p>
        <small>{err ? err.message : 'Not sure actually...'}</small>
      </div>
    )
  }
}
