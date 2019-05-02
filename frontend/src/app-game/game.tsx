import { h, render } from 'preact'
import { App } from './game.view'
// import NoSleep from 'nosleep.js'

// On iOS and Android the address/menu bars overlay content. Visually this
// is not appealing. Constraing the content area within window.innerHeight
const mountNode = document.getElementById('root') as HTMLElement
mountNode.style.height = `${window.innerHeight}px`

// Prevent screen from going to sleep. While a user moves the phone performing
// motions it could lock if they have a short timeout set
// const plsnoslp = new NoSleep()
// document.addEventListener('touchstart', function enableNoSleep () {
//   console.log('enabled NoSleep!')
//   document.removeEventListener('touchstart', enableNoSleep, false);
//   plsnoslp.enable();
// }, false);

render(<App />, mountNode, mountNode.lastChild as HTMLElement)
