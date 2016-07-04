const opentype = require('opentype.js');
const computeLayout = require('opentype-layout');
const pathToShape = require('./util/pathToShape');
const defaults = require('lodash.defaults');
const xtend = require('xtend');
const THREE = require('three');

DEFAULT_OPTS = {
  fontSizePx: 72,
  lineHeight: 1,
  width: 600,
  letterSpacing: 0,
  currentText: undefined,
  extrude: undefined,
  callback: noop
}

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
      letterSpacing: this.letterSpacing * this.font.unitsPerEm,
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

OpenTypeGeometry.prototype.updateLayout = function(opts) {
  let _this = this;
  defaults(opts, DEFAULT_OPTS);

  Object.assign(this, opts);

  opentype.load(this.fontFace, function(err, font) {
    _this.font = font;
  });
}

OpenTypeGeometry.prototype.loadText = function(opts) {
  let _this = this;
  if(!opts.fontFace) throw new Error('must specify a fontface to load opentype geometry');
  defaults(opts, defaults(DEFAULT_OPTS, { 
        extrude: {
          amount: 4,
          steps: 2,
          bevelEnabled    : true,
          bevelThickness  : 100,
          bevelSize       : 5,
          bevelSegments   : 5
        }
      })
  );

  Object.assign(this, opts);

  opentype.load(opts.fontFace, function(err, font) {
    if (err) throw err;
    _this.chars = [];
    Object.keys(font.glyphs.glyphs).forEach(function(glyphKey) {
      let glyph = font.glyphs.glyphs[glyphKey];
      if(opts.loadFonts) {
        if(glyph.unicode !== undefined && typeof String.fromCharCode(glyph.unicode) === 'string'
          && opts.loadFonts.indexOf(String.fromCharCode(glyph.unicode)) !== -1) {
          _this.chars.push({
            code: glyph.unicode,
            geometry: pathToShape(glyph.path, opts, THREE)
          });  
        }
      }
      //load all text
      else if(glyph.unicode !== undefined && typeof String.fromCharCode(glyph.unicode) === 'string') {
        _this.chars.push({
          code: glyph.unicode,
          geometry: pathToShape(glyph.path, opts, THREE)
        });
      }
    });

    _this.font = font;
    _this.fontFace = opts.fontFace;
    opts.callback();
  });
}

module.exports = OpenTypeGeometry
