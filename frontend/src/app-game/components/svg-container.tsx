import { Component, h } from 'preact'

/**
 * Allows us to inline SVGs somewhat easily.
 * Sidenote - preact needs React SVGR support! Maybe there's a way via
 * preact-compat, but this with parcel-plugin-inlinesvg does the trick for now
 */
export class SvgContainer extends Component<{ svg: any, classes?: string }, {}> {
  render () {
    return (
      <div class={`svg-container ${this.props.classes || ''}`} dangerouslySetInnerHTML={{ __html: this.props.svg }}></div>
    )
  }
}
