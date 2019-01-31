"use strict";

class Renderer {

  constructor(w, h, theme) {
    this.w = w
    this.h = h
    this.theme = theme

    this.alphabet = ""
    for( let i = 32; i <128; i++) {
      this.alphabet += String.fromCharCode(i)
    }

    this.styles = [
      {isCursorVariable: true},
      {isSelection: true},
      {isPort: "output"},
      {isPort: "input"},
      {isPort: "passive"},
      {isPort: "haste"},
      {isPort: "???"},
      {isLocked: true},
      {}
    ]


    this.sprites = this.generateSprites()
  }

  setSize(w, h) {
    this.w = w
    this.h = h

    this.sprites = this.generateSprites()
  }

  setTheme(theme) {
    this.theme = theme

    this.sprites = this.generateSprites()
  }

  generateSprites() {
    let offscreen = new OffscreenCanvas(this.w * (this.styles.length + 1), this.h * (this.alphabet.length+1));
    let ctx = offscreen.getContext('2d', {alpha: false});
    for( let col in this.styles) {
      const style = this.styles[col];
      for (let letter in this.alphabet) {
        this._drawSprite(ctx, this.w, this.h, +col, +letter, this.alphabet[letter], this.theme, style)
      }
    }

    return offscreen;
  }

  drawSprite(ctx, x, y, g, styles) {
    let col = 0;
    if (styles.isCursorVariable) {
      col = 0
    } else if (styles.f && styles.b && this.theme[styles.f] && this.theme[styles.b]) {
      ctx.textBaseline = 'bottom'
      ctx.textAlign = 'center'
      ctx.font = `${this.h * 0.75}px input_mono_medium`

      ctx.fillStyle = this.theme[styles.b]
      ctx.fillRect(x * this.w, (y) * this.h, this.w, this.h)
      ctx.fillStyle = this.theme[styles.f]
      ctx.fillText(g, (x + 0.5) * this.w, (y + 1) * this.h)
      return
    }
    else if (styles.isSelection) {
      col = 1
    } else if (styles.isPort) {
      if (styles.isPort === 'output') { // Output
        col = 2;
      } else if (styles.isPort === 'input') { // Input
        col = 3;
      } else if (styles.isPort === 'passive') { // Passive
        col = 4;
      } else if (styles.isPort === 'haste') { // Haste
        col = 5;
      } else {
        col = 6
      }
    } else if (styles.isLocked) {
      col = 7;
    } else {
      col = 8
    }
    ctx.drawImage(this.sprites,
        col * this.w, (g.charCodeAt(0)-32) * this.h, this.w, this.h,
        x * this.w  , y * this.h,  this.w, this.h )
  }


  _drawSprite(ctx, w, h, x, y, g, theme, styles = { isCursor: false, isSelection: false, isPort: false, f: null, b: null, isCursorVariable: false }) {
    ctx.textBaseline = 'bottom'
    ctx.textAlign = 'center'
    ctx.font = `${h * 0.75}px input_mono_medium`

    // Highlight Variables
    if (styles.isCursorVariable) {
      ctx.fillStyle = theme.b_inv
      ctx.fillRect(x * w, (y) * h, w, h)
      ctx.fillStyle = theme.background
    } else if (styles.isSelection) {
      ctx.fillStyle = theme.b_inv
      ctx.fillRect(x * w, (y) * h, w, h)
      ctx.fillStyle = theme.f_inv
    } else if (styles.isPort) {
      if (styles.isPort === 'output') { // Output
        ctx.fillStyle = theme.b_high
        ctx.fillRect(x * w, (y) * h, w, h)
        ctx.fillStyle = theme.f_low
      } else if (styles.isPort === 'input') { // Input
        ctx.fillStyle = theme.b_high
      } else if (styles.isPort === 'passive') { // Passive
        ctx.fillStyle = theme.b_med
        ctx.fillRect(x * w, (y) * h, w, h)
        ctx.fillStyle = theme.f_low
      } else if (styles.isPort === 'haste') { // Haste
        ctx.fillStyle = theme.background
        ctx.fillRect(x * w, (y) * h, w, h)
        ctx.fillStyle = theme.b_med
      } else {
        ctx.fillStyle = theme.background
        ctx.fillRect(x * w, (y) * h, w, h)
        ctx.fillStyle = theme.f_high
      }
    } else if (styles.isLocked) {
      ctx.fillStyle = theme.f_med
    } else {
      ctx.fillStyle = theme.f_low
    }

    ctx.fillText(g, (x + 0.5) * w, (y + 1) * h)
  }
}

module.exports = Renderer
