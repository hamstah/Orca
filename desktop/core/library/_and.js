'use strict'

const Operator = require('../operator')

function OperatorAnd (orca, x, y) {
  Operator.call(this, orca, x, y, '&', true)

  this.name = 'and'
  this.info = 'Bangs if both both inputs are bangs.'

  this.ports.input.a = { x: 1, y: 0 }
  this.ports.input.b = { x: 2, y: 0 }
  this.ports.output = { x: 0, y: 1 }

  this.haste = function () {
    orca.lock(this.x, this.y + 1)
  }

  this.run = function () {
    const a = this.listen(this.ports.input.a)
    const b = this.listen(this.ports.input.b)
    const res = a === '*' && b === '*' ? '*' : '.'
    this.output(`${res}`)
  }
}

module.exports = OperatorAnd
