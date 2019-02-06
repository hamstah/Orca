"use strict"

class WrappedClock {

	constructor(device) {
		this.device = device
		this.running = false
		this.callback = () => {}
    this.count = 0

    this.signals = {
      CLOCK: 0xF8,
      START: 0xFA,
      STOP: 0xFC
    }

	}

	canSetBpm() {
		return false
	}

	setCallback(callback) {
		this.callback = callback
	}

	setRunning(running) {
		this.running = running
		this.reset()
	}

	reset() {
		if(this.running) {
			this.device.onmidimessage = (message) => {this.onMIDIMessage(message)}
		} else {
			this.device.onmidimessage = null
		}
	}

	toString() {
		return `${this.device.name}`
	}




	onMIDIMessage(message) {
    switch(message.data[0]) {
      case this.signals.CLOCK:
        this.count = (this.count + 1) % 6
        if(this.count == 0) {
          this.callback()
        }
        break
      case this.signals.START:
        this.setRunning(true)
        break
      case this.signals.STOP:
        this.setRunning(false)
        break
    }
	}
}

class MidiClock {

	constructor(terminal) {
		this.terminal = terminal
	}

	start() {
		console.info("Starting Midi Clock...")
		this.setup()
	}

	setup() {
		if (!navigator.requestMIDIAccess) { return }
		navigator.requestMIDIAccess({ sysex: false }).then((midiAccess) => {this.onMIDIAccess(midiAccess)}, (err) => {
			console.warn("No Midi", err)
		})
	}

	onMIDIAccess(midiAccess) {
		console.log("ON MIDI ACCESS")
		console.log(midiAccess)
		const iter = midiAccess.inputs.values()
		console.log(iter)
		for (let i = iter.next(); i && !i.done; i = iter.next()) {
			this.terminal.clocks.push(new WrappedClock(i.value))
		}
	}

}

module.exports = MidiClock
