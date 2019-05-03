import { h, render } from 'preact'
import { App } from './game.view'
import NoSleep from 'nosleep.js'
import { isMobileDevice } from '@app/utils'

const mountNode = document.getElementById('root') as HTMLElement

// Prevent screen from going to sleep. While a user moves the phone performing
// motions it could lock if they have a short timeout set
if (isMobileDevice()) {
  const plsnoslp = new NoSleep()
  document.addEventListener('touchstart', function enableNoSleep () {
    console.log('NoSleep is now enabled!')

    document.removeEventListener('touchstart', enableNoSleep, false)
    plsnoslp.enable()
  }, false)
}

render(<App />, mountNode, mountNode.lastChild as HTMLElement)
