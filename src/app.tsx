import { h } from 'preact'
import { ViewsContainer } from './components/views/container'
import { startMotionAndOrietationTracking } from '@app/orientation-and-motion'
import * as ws from '@app/websocks/ws'

import '@styles/style.scss'
import '@styles/game.scss'

startMotionAndOrietationTracking()
ws.connect()

export const App = () => (
  <ViewsContainer/>
)
