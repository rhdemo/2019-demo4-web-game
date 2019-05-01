import { Component, h } from 'preact'

import GameOverSVG from '@public/assets/images/svg/game-over-background.svg'

export class GameOverBackground extends Component<{}, {}> {
  render () {
    return (
      <img src={GameOverSVG} alt=''/>
    )
  }
}
