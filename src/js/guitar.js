import GuitarString, { FREQUENCIES } from './guitar-string'

export default class Guitar {
  constructor({
    audioContext = new AudioContext()
  } = {}) {
    this.audioContext = audioContext
    this.strings = [
      new GuitarString({ audioContext, baseFrequency: FREQUENCIES.E2 }),
      new GuitarString({ audioContext, baseFrequency: FREQUENCIES.A2 }),
      new GuitarString({ audioContext, baseFrequency: FREQUENCIES.D3 }),
      new GuitarString({ audioContext, baseFrequency: FREQUENCIES.G3 }),
      new GuitarString({ audioContext, baseFrequency: FREQUENCIES.B3 }),
      new GuitarString({ audioContext, baseFrequency: FREQUENCIES.E4 })
    ]
  }

  strum(chord = [], strumDuration = 0.05) {
    let pluckedCount = 0
    chord.forEach((fret, i) => {
      if (fret >= 0) {
        setTimeout(() => this.strings[i].pluck(fret), Math.floor(pluckedCount * strumDuration * 1000 / 6))
        pluckedCount++
      }
    })
  }

  pluck(string = 6, fret = 0) {
    const stringIndex = Math.abs(string - 6)
    this.strings[stringIndex].pluck(fret)
  }

  mute() {
    this.strings.forEach((s) => s.mute())
  }
}

/*
TODOs:
  - Use one common gain node for all strings
*/