import { h, render } from 'preact'
import { TrainingView } from './training.view'

const mountNode = document.getElementById('root') as HTMLElement
render(<TrainingView />, mountNode, mountNode.lastChild as HTMLElement)
