let game = {
  id: null,
  state: "loading",
  shakeDemo: {
    enabled: true,
    multiplier: 2,
    maxPerSecond: 1000
  },
  motions: {
    shake: false,
    circle: false,
    x: false,
    roll: false,
    fever: false,
    floss: false,
  }
}

module.exports = game;
