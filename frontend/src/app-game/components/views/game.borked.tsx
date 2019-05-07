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

  getChromeUrl () {
    const href = window.location.href
    const proto = window.location.protocol

    if (proto.indexOf('https') !== -1) {
      return href.replace('https', 'googlechromes')
    } else {
      return href.replace('http', 'googlechrome')
    }
  }

  render () {
    log('render')

    const err = getState().error

    if (err instanceof DeviceMotionUnavailableError && isAppleTwelveDevice()) {
      return (
        <div class='game borked' style="text-transform: none !important;">
          <div style='text-align: left;'>
            <p class='center'>To play this game on iOS, please switch to <a href={this.getChromeUrl()}>Google Chrome</a>.</p>
            <b><h3 class='center'>OR</h3></b>
            <ol>
              <li style="padding-top: 0;">Open the Settings application.</li>
              <li>Scroll down and select <i>Safari</i>.</li>
              <li>Scroll to <i>Motion & Orientation Access</i> and enable it.</li>
              <li>Refresh this page after doing so and you'll be able to play!</li>
            </ol>
          </div>
        </div>
      )
    }

    return (
      <div class='game borked'>
        <h2>GAME ERROR</h2>
        <p>
          Sorry! If you're seeing this then something isn't working the way it
          should.
        </p>
        <p>Here are some details:</p>
        <small>{err ? err.message : 'Not sure actually...'}</small>
      </div>
    )
  }
}
