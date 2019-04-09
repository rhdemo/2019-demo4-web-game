export function isDeviceSupported () {
  if (process.env.NODE_ENV === 'production') {
    return navigator.userAgent.match(/ipod|iphone|ipad|android/ig) !== null
  } else {
    return true
  }
}

export function isAppleTwelveDevice () {
  // TODO: check for minor version number
  return navigator.userAgent.match(/iPhone OS 12_2/gi)
}

export function machineIdToLetter (id: number) {
  const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k']

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
