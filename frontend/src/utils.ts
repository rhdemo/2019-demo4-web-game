export function isDeviceSupported () {
  return navigator.userAgent.match(/ipod|iphone|ipad|android/ig) !== null
  if (process.env.NODE_ENV === 'production') {
    return navigator.userAgent.match(/ipod|iphone|ipad|android/ig) !== null
  } else {
    return true
  }
}
