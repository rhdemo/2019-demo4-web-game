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

    return (
      <div style={`background-image: url(${GameOverSVG})`} class='game stopped'>
        <div class='overlay'>
          <h1>Game Over</h1>
          <h2>{this.props.username}</h2>
          <div class='message'>
            <p>8<sup>th</sup> place</p>
            <p>Final score: {this.props.score}</p>
            <p>You did {this.props.motions.length} out of 6 motions</p>
          </div>
        </div>
      </div>
    )
  }
}

interface GameStoppedViewProps {
  score: number
  username: string
  motions: string[] // TODO
}
