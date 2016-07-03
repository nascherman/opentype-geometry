const opentype = require('opentype.js');
const computeLayout = require('opentype-layout');
const pathToShape = require('./util/pathToShape');
const defaults = require('lodash.defaults');
const xtend = require('xtend');
const THREE = require('three');

function noop() {}

function OpenTypeGeometry(opts) {
  opts = opts || {};
  if(opts.fontFace) 
    this.loadText(opts);
}

OpenTypeGeometry.prototype.setText = function(text) {
  let _this = this;
    let scale = 1 / this.font.unitsPerEm * this.fontSizePx;
    let result = computeLayout(this.font, text, {
      lineHeight: this.lineHeight * this.font.unitsPerEm,
      width: this.width / scale
    });

    this.currentText = result.glyphs.map(function(glyph) {
      return {
        position: glyph.position,
        row: glyph.row,
        index: glyph.index,
        geometry:_this.chars[_this.chars.findIndex(x => x.code === glyph.data.unicode)]
      };
    });
}

OpenTypeGeometry.prototype.loadText = function(opts) {
  let _this = this;
  if(!opts.fontFace) throw new Error('must specify a fontface to load opentype geometry');
  defaults(opts, {
    fontSizePx: 72,
    lineHeight: 2,
    width: 600,
    text: 'No text',
    extrude: {
      amount: 1000,
      steps: 1000,
      bevelEnabled    : true,
      bevelThickness  : 100,
      bevelSize       : 100,
      bevelSegments   : 4
    },
    callback: noop
  });

  Object.assign(this, opts);

  opentype.load(opts.fontFace, function(err, font) {
    if (err) throw err;
    _this.chars = [];
    Object.keys(font.glyphs.glyphs).forEach(function(glyphKey) {
      let glyph = font.glyphs.glyphs[glyphKey];
      if(glyph.unicode !== undefined && typeof String.fromCharCode(glyph.unicode) === 'string') {
        _this.chars.push({
          code: glyph.unicode,
          geometry: pathToShape(glyph.path, opts, THREE)
        });
      }
    });

    _this.font = font;
    opts.callback();
  });
}

module.exports = OpenTypeGeometry
