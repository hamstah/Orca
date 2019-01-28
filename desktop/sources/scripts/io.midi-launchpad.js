'use strict'

function MidiLaunchpad (terminal) {
  this.index = 0
  this.devices = []
  this.stack = []
  this.pad = {}
  this.config = {}

  this.start = function () {
    console.info('Starting Midi Launchpad..')
    this.setup()
  }

  this.clear = function () {
  }

  this.run = function () {
  }

  this.update = function () {
    console.log(this.device())
    this.pad = {}
    this.config = {}
    this.device().input.onmidimessage = this.onmidimessage
  }

  // Midi

  this.select = function (id) {
    const currentDevice = this.device()
    if (currentDevice) {
      currentDevice.input.onmidimessage = null;
    }
    if (!this.devices[id]) { return }
    this.index = parseInt(id)
    this.update()
    // RESET
    terminal.io.midilaunchpad.device().output.send([
      0xf0, 0x00, 0x20, 0x29, 0x02, 0x18, 0x0e, 0x00, 0xf7,
    ])

    // Scroll ORCA
    terminal.io.midilaunchpad.device().output.send([
      0xF0, 0x00, 0x20, 0x29, 0x02, 0x18, 0x14,
      59, // colour
      0, // loop,
      0x4f, 0x52, 0x43, 0x41, 0x0a, // ORCA
      0xF7,
    ])
    console.log(`Midi Device: ${this.device().input.name}`)
    return this.device()
  }

  this.device = function () {
    return this.devices[this.index]
  }

  this.setConfig = function(x, y, color) {
    const key = this.getKey(x, y)
    if (!this.config[key] || this.config[key].color == color) {
      if (this.isKeyOn(key)) {
        terminal.io.midilaunchpad.device().output.send([0x90, key, color])
      } else {
        terminal.io.midilaunchpad.device().output.send([0x90, key, 1])
      }
    }
    this.config[key] = {color: color}
  }

  this.getConfig = function(key) {
    return this.config[key]
  }

  this.onmidimessage = function(message) {
    if (message.data.length != 3) {
      return;
    }

    if (message.data[0] != 144) {
      return;
    }

    const key = message.data[1];
    const down = message.data[2] != 0;

    const config = terminal.io.midilaunchpad.getConfig(key)
    if (! config) {
      return
    }

    terminal.io.midilaunchpad.pad[key] = (terminal.io.midilaunchpad.pad[key] || 0) + 1
    if(terminal.io.midilaunchpad.isKeyOn(key)) {
      terminal.io.midilaunchpad.device().output.send([0x90, key, config.color])
    } else {
      terminal.io.midilaunchpad.device().output.send([0x90, key, 1])
    }
  }

  this.isKeyOn = function(key) {
    console.log(key, terminal.io.midilaunchpad.pad[key])
    return (terminal.io.midilaunchpad.pad[key] || 0) % 4 != 0
  }

  this.getKey = function(x, y) {
    return (parseInt(y) + 1) * 10 + parseInt(x) + 1;
  }

  this.isOn = function(x, y) {
    const key = this.getKey(x, y)
    return this.isKeyOn(key)
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
    navigator.requestMIDIAccess({ sysex: true }).then(this.access, (err) => {
      console.warn('No Midi', err)
    })
  }

  this.access = function (midiAccess) {
    let device = {input: null, output: null}

    const iterInputs = midiAccess.inputs.values()
    for (let i = iterInputs.next(); i && !i.done; i = iterInputs.next()) {
      if (i.value.name != "Launchpad MK2 MIDI 1") {
        continue;
      }
      device.input = i.value
      break
    }

    const iterOutputs = midiAccess.outputs.values()
    for (let i = iterOutputs.next(); i && !i.done; i = iterOutputs.next()) {
      if (i.value.name != "Launchpad MK2 MIDI 1") {
        continue;
      }
      device.output = i.value;
      break
    }

    if (device.input && device.output) {
      terminal.io.midilaunchpad.devices.push(device)
    }
    terminal.io.midilaunchpad.select(0)
  }

  this.toString = function () {
    return this.devices.length > 0 ? `${this.devices[this.index].input.name}` : 'No Launchpad'
  }
}

module.exports = MidiLaunchpad
