'use strict'

const Operator = require('../operator')

function OperatorOr (orca, x, y) {
  Operator.call(this, orca, x, y, '|', true)

  this.name = 'or'
  this.info = 'Bangs if both either inputs is a bang.'

  this.ports.input.a = { x: 1, y: 0 }
  this.ports.input.b = { x: 2, y: 0 }
  this.ports.output = { x: 0, y: 1 }

  this.haste = function () {
    orca.lock(this.x, this.y + 1)
  }

  this.run = function () {
    const a = this.listen(this.ports.input.a)
    const b = this.listen(this.ports.input.b)
    const res = (a === '*' || b === '*') ? '*' : '.'
    this.output(`${res}`)
  }
}

module.exports = OperatorOr
