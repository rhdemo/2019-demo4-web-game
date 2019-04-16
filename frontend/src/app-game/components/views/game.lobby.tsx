import { Component, h } from 'preact'
import { GameConfiguration } from '@app/interfaces'
import { getState } from '@app/store'
import getLogger from '@app/log'

const log = getLogger('view:game.lobby')

export class GameLobbyView extends Component<{}, GameLobbyViewState> {
  constructor () {
    super()

    log('creating')

    this.setState({
      config: getState().config
    })
  }

  render () {
    log('render')
    return (
      <div class='game lobby'>
        <br/>
        <h2>Welcome {this.state.config.username}</h2>
        <br />
        <h1 style='margin: 5vh 0;'>It's time to WRECK IT!</h1>
        <br />
        <p>The game will begin shortly...</p>
      </div>
    )
  }
}

interface GameLobbyViewState {
  config: GameConfiguration
}
