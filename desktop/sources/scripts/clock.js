'use strict';

class Clock {

  constructor(bpm, callback) {
    this.bpm = 0
    this.callback = callback
    this.timer = null
    this.running = false

    this.setBpm(bpm)
  }

  setBpm(bpm) {
    this.bpm = bpm
    this.reset()
  }

  reset() {
    if(this.timer) {
      clearInterval(this.timer)
    }

    if(this.running) {
      this.timer = setInterval(() => { this.callback() }, (60000 / this.bpm) / 4)
    }
  }

  setRunning(running) {
    this.running = running
    this.reset()
  }

  start() {
    this.setRunning(true)
  }

  stop(){
    this.setRunning(false)
  }

  toString() {
    return `${this.bpm}`
  }

}

module.exports = Clock
