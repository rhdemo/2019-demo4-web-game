import { h, render } from 'preact'
import { App } from './game.view'

const mountNode = document.getElementById('root') as HTMLElement

mountNode.style.height = `${window.innerHeight}px`

render(<App />, mountNode, mountNode.lastChild as HTMLElement)
