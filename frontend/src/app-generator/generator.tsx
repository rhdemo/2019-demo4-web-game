import { h, render } from 'preact'
import { GeneratorView } from './generator.view'

const mountNode = document.getElementById('root') as HTMLElement
render(<GeneratorView />, mountNode, mountNode.lastChild as HTMLElement)
