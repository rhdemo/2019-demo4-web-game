import { Component, h } from 'preact'
import Sockette from 'sockette'
import getLogger from '@app/log'
import { initialiseMotionAndOrietationTracking, startSendLoop, stopSendLoop } from '@app/orientation-and-motion'
import formatFactory from 'format-number'

const formatNumber = formatFactory()
const log = getLogger('view:generator')

export class GeneratorView extends Component<{}, GeneratorState> {
  private readonly sock: Sockette

  constructor () {
    super()

    this.setState({
      // ...or change manually here
      wssAddress: this.getWssParam(),
      generating: false,
      wsConnected: false,
      sendCount: 0
    })

    this.sock = new Sockette(this.state.wssAddress, {
      timeout: 2500,
      onopen: (e) => {
        log('ws:connected!', e)
        this.setState({
          wsConnected: true
        })
      },
      onmessage: (e) => {
        log('ws:received message', e)
      },
      onreconnect: (e) => log('ws:reconnecting...', e),
      onmaximum: (e) => log('ws:reached maximum number of reconnect attempts'),
      onclose: (e) => {
        log('ws:close event detected', e)
        this.setState({
          wsConnected: false
        })
        if (!e.wasClean) {
          log(
            'did not close cleanly. this indicates a dropped connection. reconnection will be attempted automatically'
          )
        }
      },
      onerror: (e) => {
        this.setState({
          wsConnected: false
        })
        log('WebSocket Error:', e)
      }
    })

    initialiseMotionAndOrietationTracking((data) => {
      this.setState({
        sendCount: this.state.sendCount + 1
      })
      this.sock.json(data)
    })
  }

  getWssParam () {
    const wssHost = new URL(window.location.href).searchParams.get('wss') || `ws://${window.location.host}`,

    if (wssHost.indexOf('ws://') === -1) {
      return `ws://${wssHost}`
    }

    return wssHost
  }

  toggleGenerating () {
    this.setState({
      generating: !this.state.generating
    })

    if (this.state.generating) {
      startSendLoop(250)
    } else {
      stopSendLoop()
    }
  }

  render () {
    let primaryContent: JSX.Element
    let secondaryContent: JSX.Element | null

    if (!this.state.wsConnected) {
      primaryContent = (
        <div>
          <p>Waiting on WebSocket connection...</p>
        </div>
      )
      secondaryContent = null
    } else {
      primaryContent = (
        <div style='margin-top: 15vh;'>
          <p style='font-size: 1.2em;'>You can use the button below to toggle sending motion data.</p>
          <button style='font-size: 12pt' onClick={() => this.toggleGenerating()} class='button-primary'>{this.state.generating ? 'Stop' : 'Start'}</button>
        </div>
      )
      secondaryContent = (
        <div>
          { this.state.generating ? `Sent ${formatNumber(this.state.sendCount)} payloads` : '' }
        </div>
      )
    }

    const style = {
      'border-radius': '50%',
      'background': this.state.wsConnected ? 'green' : 'red',
      'height': '1em',
      'width': '1em',
      'display': 'inline-block',
      'vertical-align': 'text-bottom'
    }

    return (
      <div class='container' style='text-align: center;'>
        <br/>
        <h3>Motion Data Generator</h3>
        <hr/>
        {primaryContent}
        {secondaryContent}

        <div class='row' style='position: fixed;
    text-align: left;
    bottom: 0;
    background: #444;
    color: white;
    width: 100vw;
    left: 0;
    padding: 1em;'>
          <div class='one-half column'>WS Address: {this.state.wssAddress}</div>
          <div class='one-half column'>WS State: <div style={style}></div> </div>
        </div>
      </div>
    )
  }
}

interface GeneratorState {
  generating: boolean
  wssAddress: string
  wsConnected: boolean
  sendCount: number
}
