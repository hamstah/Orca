'use strict';

function Midi (terminal) {
  this.index = 0
  this.devices = []
  this.stack = []

  this.start = function () {
    console.info('Starting Midi..')
    this.setup()
  }

  this.clear = function () {
    this.stack = []
  }

  this.run = function () {
    for (const id in this.stack) {
      this.play(this.stack[id], this.device())
    }
  }

  this.update = function () {
    terminal.controller.clearCat('default', 'Midi')
    const devices = terminal.io.midi.list()
    for (const id in devices) {
      terminal.controller.add('default', 'Midi', `${devices[id].name} ${terminal.io.midi.index === parseInt(id) ? ' — Active' : ''}`, () => { terminal.io.midi.select(id) }, '')
    }
    if (devices.length < 1) {
      terminal.controller.add('default', 'Midi', `No Device Available`)
    }
    if (devices.length > 1) {
      terminal.controller.add('default', 'Midi', `Next Device`, () => { terminal.io.midi.next(id) }, 'CmdOrCtrl+Shift+M')
    }
    terminal.controller.commit()
  }

  // Midi

  this.sendNote = function (channel, octave, note, velocity, length, now) {
    this.send(["note", channel, octave, note, velocity, length], now)
  }

  this.sendControlChange = function(channel, value, now) {
    this.send(["control-change", channel, value], now)
  }

  this.send = function(data, now) {
    if (now) {
      this.play(data, this.device())
    } else {
      this.stack.push(data)
    }
  }

  this.play = function (data = this.stack, device) {
    if (!device) { console.warn('No midi device!'); return }

    switch (data[0]) {
      case "control-change": {
          let channel = data[1]
          let value = data[2]
          // offset with 64 as we can't get the full 0-127 range and 64-100 is
          // the most common range used by devices
          device.send([0xb0, 64 + channel, value])
          break
        }

      case "note": {
        let channel = convertChannel(data[1])
        let note = convertNote(data[2], data[3])
        let velocity = data[4]
        let length = window.performance.now() + convertLength(data[5], terminal.bpm)

        device.send([channel[0], note, velocity])
        device.send([channel[1], note, velocity], length)
        break
      }
      default:
        console.log("Unsupported", data[0])
        break
    }
  }

  this.select = function (id) {
    if (!this.devices[id]) { return }
    this.index = parseInt(id)
    this.update()
    console.log(`Midi Device: ${this.device().name}`)
    return this.device()
  }

  this.device = function () {
    return this.devices[this.index]
  }

  this.list = function () {
    return this.devices
  }

  this.next = function () {
    this.select((this.index + 1) % this.devices.length)
  }

  // Setup

  this.setup = function () {
    if (!navigator.requestMIDIAccess) { return }
    navigator.requestMIDIAccess({ sysex: false }).then(this.access, (err) => {
      console.warn('No Midi', err)
    })
  }

  this.access = function (midiAccess) {
    const iter = midiAccess.outputs.values()
    for (let i = iter.next(); i && !i.done; i = iter.next()) {
      terminal.io.midi.devices.push(i.value)
    }
    terminal.io.midi.select(0)
  }

  this.toString = function () {
    return this.devices.length > 0 ? `${this.devices[this.index].name}` : 'No Midi'
  }

  function convertChannel (id) {
    return [0x90 + id, 0x80 + id]
  }

  function convertNote (octave, note) {
    return 24 + (octave * 12) + note // 60 = C3
  }

  function convertLength (val, bpm) {
    // TODO get bpm from daw midi
    if (! bpm) {
      bpm = 120;
    }
    return (60000 / bpm) * (val / 15)
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Midi
