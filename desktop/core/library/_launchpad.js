'use strict'

/*
TODO
* Handle delete
* Clear on exit
*/

const Operator = require('../operator')

function OperatorLaunchpad (orca, x, y, passive) {
  Operator.call(this, orca, x, y, '/', true)
  console.log("CREATE")
  this.name = 'launchpad'
  this.info = 'Map launchpad button.'

  this.ports.haste.x = { x: 1, y: 0 }
  this.ports.haste.y = { x: 2, y: 0 }
  this.ports.input.val = { x: 0, y: -1 }
  this.ports.input.color = {x: 3, y: 0}
  this.ports.output = { x: 0, y: 1 }


  this.run = function () {

    const x = this.listen(this.ports.haste.x, false, 0, 7)
    const y = this.listen(this.ports.haste.y, false, 0, 7)
    const color = this.listen(this.ports.input.color, true, 0, 36) || 10
    const val = this.listen(this.ports.input.val)

    if (x === '.' || y === '.') {
      return;
    }

    terminal.io.midilaunchpad.setConfig(x, y, color)

    let res = '.';
    if (terminal.io.midilaunchpad.isOn(x, y) && val) {
      res = val
    }
    this.output(`${res}`)
  }

}

module.exports = OperatorLaunchpad
