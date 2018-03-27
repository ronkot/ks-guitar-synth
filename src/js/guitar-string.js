import { requiredParam } from './utils'

export const FREQUENCIES = {
  E2: 82.41,
  A2: 110.0,
  D3: 146.83,
  G3: 196.0,
  B3: 246.94,
  E4: 329.63
}

export default class GuitarString {
  constructor({ baseFrequency = FREQUENCIES.E2, audioContext = requiredParam('audioContext') } = {}) {
    this.audioContext = audioContext
    this.baseFrequency = baseFrequency
    this.playing = false
    this.scriptNode = null
    this.gainNode = null // TODO: remove this safety feature
    this.muteTimer = null
  }

  pluck(fret = 0) {
    if (fret < 0) return

    if (this.playing) {
      this.mute()
    }

    this.scriptNode = this.audioContext.createScriptProcessor(1024, 1, 1)

    const frequency = this.baseFrequency * 2 ** (fret / 12)
    const bufferLength = Math.round(this.audioContext.sampleRate / frequency)
    const buffer = new Float32Array(bufferLength)

    let iBuffer = 0
    let initialized = false

    this.scriptNode.onaudioprocess = ({ inputBuffer, outputBuffer }) => {
      const inputData = inputBuffer.getChannelData(0)
      const outputData = outputBuffer.getChannelData(0)
      for (let i = 0; i < outputBuffer.length; i++) {
        if (!initialized) {
          const value = Math.random() * 2 - 1
          outputData[i] = value
          buffer[iBuffer] = value
          if (iBuffer === bufferLength - 1) {
            initialized = true
          }
        } else {
          const sample1 = buffer[(iBuffer - 1 + bufferLength) % bufferLength]
          const sample2 = buffer[(iBuffer + bufferLength) % bufferLength]
          const value = (sample1 + sample2) / 2
          outputData[i] = value
          buffer[iBuffer] = value
        }
        iBuffer = (iBuffer + 1) % bufferLength
      }
    }

    this.gainNode = this.audioContext.createGain()
    this.gainNode.gain.value = 0.02
    this.scriptNode.connect(this.gainNode)
    this.gainNode.connect(this.audioContext.destination)

    this.muteTimer = setTimeout(this.mute.bind(this), 6000) // TODO: clever way to string after it's silent
    this.playing = true
  }

  mute() {
    if (this.playing) {
      this.gainNode.disconnect(this.audioContext.destination)
      this.playing = false
      clearTimeout(this.muteTimer)
    }
  }
}
