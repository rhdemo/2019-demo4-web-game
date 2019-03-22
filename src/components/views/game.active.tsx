import { Component, h } from 'preact'
import { startSendLoop, stopSendLoop } from '@app/orientation-and-motion'
import { GameConfiguration } from '@app/interfaces'
import { ApplicationEventTypes, emitter, getState } from '@app/store'
import getLogger from '@app/log'

const log = getLogger('view:game.active')

export class GameActiveView extends Component<{}, GameActiveViewState> {

  constructor () {
    super()
    log('creating')
    this.setState({
      config: getState().config
    })

    // Binding "this" for event handlers
    this.onConfigChange = this.onConfigChange.bind(this)
  }

  onConfigChange (config: GameConfiguration) {
    this.setState({ config })
  }

  componentWillMount () {
    log('will mount')
    emitter.addListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
    startSendLoop()
  }

  componentWillUnmount () {
    log('will unmount')
    emitter.removeListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
    stopSendLoop()
  }

  componentDidMount () {
    log('did mount')
    const container = window.radialIndicator('#indicator-container', {
      initValue: 75,
      radius: 22.5,
      fontColor: '#111',
      format: (value: number) => {
        // Complete hack...but hey, that's what we be doin'
        // Just return the machine assigned to this user...
        // TODO
        return '5'
      }
    })
  }

  render () {
    log('render')
    return (
      <div class='game active'>
        <div style='padding: 1em 0 2em; background: white;'>
          <p>{this.state.config.username}</p>
          <h4>Wreck Machine</h4>
        </div>

        <div id='indicator-container'></div>

        <div>
          {/* Dance moves will go here */}
        </div>

        <div style='position: absolute;bottom: 0;background: white;padding: 1em 0;width: 100vw;'>
          <h4>You Have</h4>
          <h2>{this.state.config.score} Points</h2>
        </div>
      </div>
    )
  }
}

interface GameActiveViewState {
  config: GameConfiguration
}
