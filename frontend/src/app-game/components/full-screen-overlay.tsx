import { Component, h } from 'preact'

import '@styles/full-screen-overlay.scss'

export class FullScreenOverlay extends Component<OverlayProps, {}> {
  render () {
    return (
      <div class={`fullscreen-overlay ${this.props.classes}`}>
        <img src={this.props.svg}/>
        <h2>{this.props.text}</h2>
      </div>
    )
  }
}

interface OverlayProps {
  svg: any
  text: string
  classes: string
}
