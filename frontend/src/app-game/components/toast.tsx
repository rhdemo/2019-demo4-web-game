import { Component, h } from 'preact'
import getLogger from '@app/log'
import { ApplicationEventTypes, emitter, getState } from '@app/store'

import '@styles/toast.scss'

const log = getLogger('component:toast')

interface ToastState {
  message?: string
  timer?: NodeJS.Timer
}

export class Toast extends Component<{}, ToastState> {
  constructor () {
    log('creating')

    super()

    this.onAppState = this.onAppState.bind(this)
  }

  onAppState () {
    const message = getState().toastMessage

    if (message) {
      if (this.state.timer) {
        // Clear old timer if one exists
        clearTimeout(this.state.timer)
      }

      const timer = setTimeout(() => {
        this.setState({
          timer: undefined
        })
      }, 3500)

      this.setState({ timer, message })
    }
  }

  componentWillMount () {
    log('componentWillMount')
    emitter.addListener(ApplicationEventTypes.AppStateUpdate, this.onAppState)
  }

  componentWillUnmount () {
    log('componentWillUnmount')
    emitter.removeListener(ApplicationEventTypes.ConfigUpdate, this.onAppState)
  }

  render () {
    log('render')
    const visibilityClass = this.state.timer ? 'visible' : 'hidden'
    return (
      <div class={`toast ${visibilityClass} stage-shadow`}>
        <p>{this.state.message}</p>
      </div>
    )
  }
}
