export function isDeviceSupported () {
  if (process.env.NODE_ENV === 'production') {
    return isMobileDevice()
  } else {
    return true
  }
}

export function isMobileDevice () {
  return navigator.userAgent.match(/ipod|iphone|ipad|android/ig) !== null
}

export function isAppleTwelveDevice () {
  // TODO: check for minor version number
  return navigator.userAgent.match(/iPhone OS 12_2/gi)
}

export function isInPortraitOrientation () {
  return window.innerHeight > window.innerWidth
}

export function machineIdToLetter (id: number) {
  const letters = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k' ]

  if (letters[id]) {
    return letters[id].toUpperCase()
  } else {
    return id.toString()
  }
}

export function getStoredPlayerId () {
  return localStorage.getItem('playerId') || undefined
}

export function removeStoredPlayerId () {
  localStorage.removeItem('playerId')
}

export function getStoredGameId () {
  return localStorage.getItem('gameId') || undefined
}

export function removeStoredGameId () {
  localStorage.removeItem('gameId')
}

export function toSentence (str: string) {
  return `${str.charAt(0).toUpperCase()}${str.slice(1, str.length)}`
}

export function getMachineColourFromId (id: number) {
  const idColorMap: Record<number, string> = {
    0: 'yellow',
    1: 'red',
    2: 'turquoise',
    3: 'baby-blue',
    4: 'green',
    5: 'purple',
    6: 'black',
    7: 'baby-blue',
    8: 'red',
    9: 'pink'
  }

  return idColorMap[id]
}
