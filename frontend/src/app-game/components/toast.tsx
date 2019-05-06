import { Component, h } from 'preact'
import { ApplicationEventTypes, emitter, getState } from '@app/store'
import { ToastMessage } from '@app/interfaces'
import getLogger from '@app/log'

import '@styles/toast.scss'
import StarSVG from '@assets/images/svg/star.svg'

const log = getLogger('component:toast')

interface ToastState {
  message?: ToastMessage
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
      }, 300000)

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

    log('setting toast visibility to: ', visibilityClass)

    if (this.state.message) {
      const { title, subtitle, star } = this.state.message
      return (
        <div class={`toast ${visibilityClass}`}>
          {star ? <img src={StarSVG}/> : undefined}
          <h1 class='pink-text'>{title}</h1>
          <h2 class='green-text'>{subtitle}</h2>
        </div>
      )
    }

    return (
      <div class={`toast ${visibilityClass}`}></div>
    )
  }
}
