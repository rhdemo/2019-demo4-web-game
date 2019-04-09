import { Component, h } from 'preact'
import getLogger from '@app/log'
import { GameConfiguration } from '@app/interfaces'
import { ApplicationEventTypes, emitter, getState, setCurrentSelectedGesture } from '@app/store'

import ArrowLeft from '@public/assets/images/svg/arrow-left.svg'
import ArrowRight from '@public/assets/images/svg/arrow-right.svg'
import MoveSquqare from '@public/assets/images/svg/moves/square.svg'

const log = getLogger('component:move-selector')

export class MoveSelector extends Component<{}, MoveSelectorState> {
  private determinationTimer: NodeJS.Timer | undefined

  constructor () {
    log('creating')

    super()

    this.setState({
      config: getState().config
    })

    this.onConfigChange = this.onConfigChange.bind(this)
  }

  onConfigChange () {
    this.setState({ config: getState().config })
  }

  componentWillMount () {
    log('will mount')

    emitter.addListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
  }

  componentWillUnmount () {
    log('will unmount')

    emitter.removeListener(ApplicationEventTypes.ConfigUpdate, this.onConfigChange)
  }

  onArrowClick (index: number) {
    const el = document.getElementById('move-scroller')

    if (el) {
      const width = el.scrollWidth
      const moveAmt = width / Object.keys(this.state.config.gameMotions).length
      el.scrollLeft = el.scrollLeft + (moveAmt * index)
    } else {
      throw new Error('#move-selector el not found!')
    }
  }

  onScroll (e: UIEvent) {
    // Processing each scroll event is wasteful and can affect scorlling perf
    // This will ensure we excute it just once - when the scrolling completes
    if (this.determinationTimer) {
      clearTimeout(this.determinationTimer)
    }

    this.determinationTimer = setTimeout(() => {
      this.determinationTimer = undefined
      this.determineNewSelection(e)
    }, 50)
  }

  determineNewSelection (e: UIEvent) {
    const srcEl = e.srcElement

    if (srcEl) {
      const el = srcEl as HTMLElement
      const position = el.scrollLeft

      if (position === 0) {
        setCurrentSelectedGesture(this.getEnabledMotionKeys()[0])
      } else {
        // We need a child node so we can use it's width (each has the same width)
        // to determine an index by dividing the scroller width by it
        const child = el.firstChild as HTMLElement

        if (!child) {
          throw new Error('no child element found!')
        }

        const width = child.offsetWidth
        const approxIdx = position / width

        setCurrentSelectedGesture(this.getEnabledMotionKeys()[Math.round(approxIdx)])
      }
    }
  }

  getEnabledMotionKeys () {
    return Object.keys(this.state.config.gameMotions)
      .filter((m) => this.state.config.gameMotions[m])
  }

  render () {
    log('rendering')

    const availableMovesEls = Object.keys(this.state.config.gameMotions)
      .filter((m) => this.state.config.gameMotions[m])
      .map((m) => {
        // TODO: Reference move svg/images
        // return <object style='min-width: 100%; scroll-snap-align: center;' data={MoveSquqare} type='image/svg+xml'></object>
        return <h3 style='min-width: 100%; scroll-snap-align: center;'>{m}</h3>
      })

    return (
      <div class='move-selector'>
        <div onClick={() => this.onArrowClick(-1)} style='flex: 0.15;'>
          <img src={ArrowLeft}></img>
        </div>

        <div id='move-scroller' onScroll={(e) => this.onScroll(e)} style='flex: 1; scroll-snap-type: x mandatory; overflow: hidden; overflow-x: scroll; display: flex;'>
          {availableMovesEls}
        </div>

        <div onClick={() => this.onArrowClick(1)} style='flex: 0.15;'>
          <img src={ArrowRight}></img>
        </div>
      </div>
    )
  }
}

interface MoveSelectorState {
  config: GameConfiguration
  selectedGesture: string
}
