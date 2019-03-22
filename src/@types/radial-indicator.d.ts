interface RadialIndicatorOptions {
  value?: number
  radius?: number
  barWidth?: number
  barBgColor?: string
  barColor?: { [key: number]: string } | string
  format?: string | RadialFormatFn
  frameTime?: number
  frameNum?: number
  fontColor?: string
  fontFamily?: string
  fontWeight?: string
  fontSize?: string
  textBaseline?: string
  interpolate?: boolean
  percentage?: boolean
  precision?: number
  displayNumber?: boolean
  roundCorner?: boolean
  minValue?: number
  maxValue?: number
  initValue?: number
  interaction?: boolean
  onChange?: () => void
}

type RadialFormatFn = (value: number) => string

interface RadialIndicatorInstance<ValidOptions> {
  defaults: RadialIndicatorOptions
  animate: (value: number) => void
  value: (value: number) => void
  option: <Key extends keyof ValidOptions>(
    property: Key,
    value: ValidOptions[Key]
  ) => void
}

interface RadialIndicatorStatic {
  defaults: RadialIndicatorOptions
  (
    selector: HTMLElement | String,
    options: RadialIndicatorOptions
  ): RadialIndicatorInstance<RadialIndicatorOptions>
}

declare module 'radial-indicator' {
  global {
    interface Window {
      radialIndicator: RadialIndicatorStatic
    }
  }

  const radialIndicator: RadialIndicatorStatic
  export = radialIndicator
}
