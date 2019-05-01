import { Component, h } from 'preact'
import getLogger from '@app/log'

import GameOverSVG from '@public/assets/images/svg/game-over-background.svg'

const log = getLogger('view:game.stopped')

export class GameStoppedView extends Component<GameStoppedViewProps, {}> {
  constructor () {
    super()
    log('creating')
  }
  render () {
    log('rendering')

    const { score, motions, playerId } = this.props

    const motionsPerformedCount = Object.values(motions).reduce((memo, n) => {
      // If the motion was performed once of more add 1 to our total
      return n > 0 ? memo + 1 : memo
    }, 0)

    return (
      <div style={`background-image: url(${GameOverSVG})`} class='game stopped'>
        <div class='overlay'>
          <h1>Game Over</h1>
          <h2>{playerId}</h2>
          <div class='message'>
            <p>8<sup>th</sup> place</p>
            <p>Final score: {score}</p>
            <p>You did {motionsPerformedCount} out of {Object.values(motions).length} motions</p>
          </div>
        </div>
      </div>
    )
  }
}

interface GameStoppedViewProps {
  score: number
  playerId: string
  motions: Record<string, number>
}
