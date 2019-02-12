import { Component, h } from 'preact'

export class GameBorkedView extends Component {
  render () {
    return (
      <div class='game borked'>
        <h2>GAME BORKED</h2>
        <h4>Sorry! If you're see this, then something isn't working the way it should.</h4>
      </div>
    )
  }
}
