// Need to set this before loading "debug"
if (process.env.NODE_ENV === 'production') {
  localStorage.debug = ''
} else {
  localStorage.debug = '*'
}

import debug from 'debug'

export default function getLogger (name: string) {
  const log = debug(name)

  return (...args: any[]) => {
    // Add a timestamp
    args.unshift(new Date().toJSON())

    // Print the log
    log.apply(log, args as any)
  }
}
