import * as gyronorm from 'gyronorm'
import { ApplicationEventTypes, emitter } from '@app/store'

export async function startMotionAndOrietationTracking () {
  const g = new gyronorm.GyroNorm()

  await g.init({
    // Poll for device motion and orientation 10 times per second
    frequency: 100,

    // Round to 5 decimal places
    decimalCount: 5
  })

  g.start(function gyroEventCallback (data: gyronorm.MotionAndOrientationPayload) {
    // console.log('received gyronorm payload', data)

    emitter.emit(
      ApplicationEventTypes.OrientationMotionEvents.Update,
      data
    )
  })
}
