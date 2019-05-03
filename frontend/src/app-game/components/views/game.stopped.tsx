import { Component, h } from 'preact'
import { getState } from '@app/store'
import { indicator } from 'ordinal'
import { SvgContainer } from '../svg-container';
import GameOverSVG from '@app/app-game/components/svgs/game-over'
import getLogger from '@app/log'

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

    let playerPlaceContent = <p></p>

    if (playerPlace) {
      // If the player was in the top X players add it to the UI
      playerPlaceContent = <p>{playerPlace}<sup>{indicator(playerPlace)}</sup> place</p>
    }

    return (
      <div class='game stopped'>
        <div class='overlay' style='background: white;'>
          <div class='svg-container'><GameOverSVG /></div>
          <h1 class='pink-text'>Game Over</h1>
          <h2 class='green-text'>{playerId}</h2>
          <div class='message'>
            {playerPlaceContent}
            <p>Final score: {score}</p>
            <p>You did {motionsPerformedCount} out of {Object.values(successfulMotions).length} motions</p>
          </div>
        </div>
      </div>
    )
  }
}
