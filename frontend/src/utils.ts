export function isDeviceSupported () {
  if (process.env.NODE_ENV === 'production') {
    return navigator.userAgent.match(/ipod|iphone|ipad|android/ig) !== null
  } else {
    return true
  }
}

export function isAppleTwelveDevice () {
  // TODO: check for minor version number
  return navigator.userAgent.match(/iPhone OS 12/gi)
}
