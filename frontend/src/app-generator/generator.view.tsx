import { Component, h } from 'preact'
import Sockette from 'sockette'
import getLogger from '@app/log'
import {
  initialiseMotionAndOrientationTracking,
  startSendLoop,
  stopSendLoop,
} from '@app/orientation-and-motion'
import formatFactory from 'format-number'
import { getSocketUrl } from '@app/websocks/ws'
import { WSS } from '@app/interfaces'

const formatNumber = formatFactory()
const log = getLogger('view:generator')

// Send motion data every 20ms, this is the lowest setting that you should use.
// Devices can only provide data every ~16ms so rounding up to simplify and give room
const SEND_RATE = 250

export class GeneratorView extends Component<{}, GeneratorState> {
  private readonly sock: Sockette

  constructor() {
    super()

    this.setState({
      // ...or change manually here
      wssAddress: this.getWssParam(),
      generating: false,
      wsConnected: false,
      sendCount: 0,
    })

    this.sock = new Sockette(this.state.wssAddress, {
      timeout: 2500,
      onopen: e => {
        log('ws:connected!', e)
        this.setState({
          wsConnected: true,
        })
      },
      onmessage: e => {
        log('ws:received message', e)
      },
      onreconnect: e => log('ws:reconnecting...', e),
      onmaximum: e => log('ws:reached maximum number of reconnect attempts'),
      onclose: e => {
        log('ws:close event detected', e)
        this.setState({
          wsConnected: false,
        })
        if (!e.wasClean) {
          log(
            'did not close cleanly. this indicates a dropped connection. reconnection will be attempted automatically'
          )
        }
      },
      onerror: e => {
        this.setState({
          wsConnected: false,
        })
        log('WebSocket Error:', e)
      },
    })

    initialiseMotionAndOrientationTracking(
      // We need a custom callback to send to as "motion-raw"
      data => {
        this.setState({
          sendCount: this.state.sendCount + 1,
        })

        this.sock.json({
          type: WSS.OutgoingFrames.Type.MotionRaw,

          // Strip timestamps and orientation from motion data
          motion: data.motion.map(m => [m[0], m[1], m[2]]),
        })
      },

      // The generator should only trigger on intense shaking movements
      {
        mOpts: {
          autoStart: false,
          threshold: 10,
          rotationRateThreshold: Infinity,
        },
      }
    )
  }

  getWssParam() {
    const wssHost = new URL(window.location.href).searchParams.get('wss')

    if (wssHost) {
      if (wssHost.indexOf('ws://') === -1) {
        return `ws://${wssHost}`
      }

      return wssHost
    } else {
      // Use real game socket logic
      return getSocketUrl()
    }
  }

  toggleGenerating() {
    this.setState({
      generating: !this.state.generating,
    })

    if (this.state.generating) {
      startSendLoop(SEND_RATE)
    } else {
      stopSendLoop()
    }
  }

  render() {
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
        <div style="margin-top: 15vh;">
          <p style="font-size: 1.2em;">
            You can use the button below to toggle sending motion data.
          </p>
          <button
            style="font-size: 12pt"
            onClick={() => this.toggleGenerating()}
            class="button-primary"
          >
            {this.state.generating ? 'Stop' : 'Start'}
          </button>
        </div>
      )
      secondaryContent = (
        <div>
          {this.state.generating
            ? `Sent ${formatNumber(this.state.sendCount)} payloads`
            : ''}
        </div>
      )
    }

    const style = {
      'border-radius': '50%',
      background: this.state.wsConnected ? 'green' : 'red',
      height: '1em',
      width: '1em',
      display: 'inline-block',
      'vertical-align': 'text-bottom',
    }

    return (
      <div class="container" style="text-align: center;">
        <br />
        <h3>Motion Data Generator</h3>
        <hr />
        {primaryContent}
        {secondaryContent}

        <div
          class="row"
          style="position: fixed;
    text-align: left;
    bottom: 0;
    background: #444;
    color: white;
    width: 100vw;
    left: 0;
    padding: 1em;"
        >
          <div class="one-half column">WS Address: {this.state.wssAddress}</div>
          <div class="one-half column">
            WS State: <div style={style} />{' '}
          </div>
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
