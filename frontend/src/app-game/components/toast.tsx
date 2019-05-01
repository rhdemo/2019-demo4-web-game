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
      }, 3000)

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
    let content: JSX.Element | undefined

    log('setting toast visibility to: ', visibilityClass)

    if (this.state.message) {
      const { title, subtitle } = this.state.message
      content = (
        <div>
          <img src={StarSVG}/>
          <h1 class='pink-text'>{title}</h1>
          <h2 class='green-text'>{subtitle}</h2>
        </div>
      )
    }

    return (
      <div class={`toast ${visibilityClass} stage-shadow`}>
        {content}
      </div>
    )
  }
}
