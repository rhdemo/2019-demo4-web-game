import { Component, h } from 'preact'
import { getState } from '@app/store'
import getLogger from '@app/log'
import { DeviceMotionUnavailableError } from '@app/orientation-and-motion';
import { isAppleTwelveDevice } from '@app/utils';

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
            IMPORTANT INFO
          </h2>

          <h4>
            Hi there Apple user! Looks like you're on iOS 12?
          </h4>
          <h4>
            To participate in this game please open your Settings application, navigate to Safari > Motion & Orientation Access, and enable it. Refresh this page after doing so and you'll be able to play!
          </h4>
        </div>
      )
    }

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
