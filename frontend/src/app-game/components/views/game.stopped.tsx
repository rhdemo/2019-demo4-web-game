import { Component, h } from 'preact'
import getLogger from '@app/log'

import GameOverSVG from '@public/assets/images/svg/game-over-background.svg'
import { getState } from '@app/store';
import { indicator } from 'ordinal'

const log = getLogger('view:game.stopped')

export class GameStoppedView extends Component<{}, {}> {
  constructor () {
    super()
    log('creating')
  }
  render () {
    log('rendering')

    const { score, successfulMotions, playerId, playerPlace } = getState().config

    const motionsPerformedCount = Object.values(successfulMotions).reduce((memo, n) => {
      // If the motion was performed once of more add 1 to our total
      return n > 0 ? memo + 1 : memo
    }, 0)

    return (
      <div style={`background-image: url(${GameOverSVG})`} class='game stopped'>
        <div class='overlay'>
          <h1 class='pink-text'>Game Over</h1>
          <h2 class='green-text'>{playerId}</h2>
          <div class='message'>
            <p>{playerPlace}<sup>{indicator(playerPlace)}</sup> place</p>
            <p>Final score: {score}</p>
            <p>You did {motionsPerformedCount} out of {Object.values(successfulMotions).length} motions</p>
          </div>
        </div>
      </div>
    )
  }
}
