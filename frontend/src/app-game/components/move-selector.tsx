import { Component, h } from 'preact'
import getLogger from '@app/log'
import { GameConfiguration } from '@app/interfaces'
import { ApplicationEventTypes, emitter, getState } from '@app/store'

import ArrowLeft from '@public/assets/images/svg/arrow-left.svg'
import ArrowRight from '@public/assets/images/svg/arrow-right.svg'
import MoveSquqare from '@public/assets/images/svg/moves/square.svg'

const TMP_MOVES = {
  // TODO use server side moves object
  'floss': true,
  'sqaure': true,
  'circle': true
}

const log = getLogger('component:move-selector')

export class MoveSelector extends Component<{}, MoveSelectorState> {
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
    console.log('click!')
    const el = document.getElementById('move-scroller')

    if (el) {
      const width = el.scrollWidth
      const moveAmt = width / Object.keys(TMP_MOVES).length
      el.scrollLeft = el.scrollLeft + (moveAmt * index)
    } else {
      throw new Error('#move-selector el not found!')
    }
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

        <div id='move-scroller' style='flex: 1; scroll-snap-type: x mandatory; overflow: hidden; overflow-x: scroll; display: flex;'>
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
}
