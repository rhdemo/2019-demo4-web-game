// Need to set this before loading "debug"
if (process.env.NODE_ENV === 'production') {
  localStorage.debug = ''
} else {
  localStorage.debug = '*'
}

import debug from 'debug'

export default function getLogger (name: string) {
  return debug(name)
}
