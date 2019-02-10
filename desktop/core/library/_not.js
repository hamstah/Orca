'use strict'

const Operator = require('../operator')

function OperatorNot (orca, x, y) {
  Operator.call(this, orca, x, y, '!', true)

  this.name = 'Not'
  this.info = 'Inverts a bang'

  this.ports.input.val = { x: 0, y: -1 }
  this.ports.output = { x: 0, y: 1 }

  this.haste = function () {
    orca.lock(this.x, this.y + 1)
  }

  this.run = function () {
    const val = this.listen(this.ports.input.val)
    this.output(val == '*' ? '.' : '*')
  }

}

module.exports = OperatorNot
