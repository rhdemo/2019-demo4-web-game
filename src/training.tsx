import { h, render } from 'preact'
import { TrainingView } from './components/views/training'

const mountNode = document.getElementById('root') as HTMLElement
render(<TrainingView />, mountNode, mountNode.lastChild as HTMLElement)
