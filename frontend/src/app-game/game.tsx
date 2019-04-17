import { h, render } from 'preact'
import { App } from './game.view'

const mountNode = document.getElementById('root') as HTMLElement

// On iOS and Android the address/menu bars overlay content. Visually this
// is not appealing. Constraing the content area within window.innerHeight
mountNode.style.height = `${window.innerHeight}px`

render(<App />, mountNode, mountNode.lastChild as HTMLElement)
