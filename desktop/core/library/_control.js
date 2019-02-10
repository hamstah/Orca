'use strict'

const Operator = require('../operator')

function OperatorMIDIControlChange (orca, x, y) {
  Operator.call(this, orca, x, y, '^', true)

  this.name = 'Midi CC'
  this.info = 'Sends a MIDI control change message.'

  this.ports.haste.channel = { x: 1, y: 0 }
  this.ports.haste.value = { x: 2, y: 0 }

  this.run = function () {
    if (!this.bang()) { return }
    this.play(false)
  }

  this.trigger = function () {
    this.play(true)
  }

  this.play = function(now) {
    let channel = this.listen(this.ports.haste.channel, true)
    let rawValue = this.listen(this.ports.haste.value, true)
    let value = Math.ceil((127 * rawValue) / 36)

    terminal.io.midi.sendControlChange(channel, value, now)
  }

}

module.exports = OperatorMIDIControlChange
