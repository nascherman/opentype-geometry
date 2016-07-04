const opentype = require('opentype.js');
const computeLayout = require('opentype-layout');
const pathToShape = require('./util/pathToShape');
const defaults = require('lodash.defaults');
const xtend = require('xtend');
const THREE = require('three');

DEFAULT_OPTS = {
  fontSizePx: 8,
  lineHeight: 1,
  width: 100,
  letterSpacing: 0,
  currentText: undefined,
  extrude: undefined,
  callback: noop
}

function noop() {}

function OpenTypeGeometry(opts) {
  opts = opts || {};
  if(opts.fontFace && opts.loadAll) 
    this.loadAllTextGeometry(opts);
}

OpenTypeGeometry.prototype.setText = function(text, opts) {
  let _this = this;
    let scale = 1 / this.font.unitsPerEm * this.fontSizePx;
    let result = computeLayout(this.font, text, {
      lineHeight: this.lineHeight * this.font.unitsPerEm,
      letterSpacing: this.letterSpacing * this.font.unitsPerEm,
      width: this.width / scale
    });

    this.currentText = result.glyphs.map(function(glyph) {
      let exists = checkIfGeometryExists.call(_this, glyph.data.unicode); 
      if(!exists) {
        _this.lazyLoadGeometry(String.fromCharCode(glyph.data.unicode), opts);
      }

      return {
        position: glyph.position,
        row: glyph.row,
        index: glyph.index,
        geometry:_this.chars[_this.chars.findIndex(x => x.code === glyph.data.unicode)]
      };  
    });

    function checkIfGeometryExists(unicode) {
      if(!this.chars) return false;
      else return this.chars[_this.chars.findIndex(x => x.code === unicode)];
    }
}

OpenTypeGeometry.prototype.updateLayout = function(opts) {
  let _this = this;
  defaults(opts, DEFAULT_OPTS);

  Object.assign(this, opts);
  this.setText(this.currentText, opts);
}

OpenTypeGeometry.prototype.lazyLoadGeometry = function(char, opts) {
  opts = opts || {};
  if(!char) throw new Error('Must specify a character to load');
  let _this = this;
  if(!this.chars) this.chars = [];
  let glyph;
  Object.keys(this.font.glyphs.glyphs).forEach(function(key) {
    if(String.fromCharCode(_this.font.glyphs.glyphs[key].unicode) === char)
      glyph = _this.font.glyphs.glyphs[key]; 
  });
  if(glyph && glyph.unicode !== undefined && typeof String.fromCharCode(glyph.unicode) === 'string') {
    _this.chars.push({
      code: glyph.unicode,
      geometry: pathToShape(glyph.path, opts, THREE)
    });  
  }
}

OpenTypeGeometry.prototype.loadAllTextGeometry = function(opts) {
  let _this = this;
  if(!opts.fontFace) throw new Error('must specify a fontface to load opentype geometry');
  defaults(opts, DEFAULT_OPTS);

  Object.assign(this, opts);
    
  this.chars = [];
  Object.keys(_this.font.glyphs.glyphs).forEach(function(glyphKey) {
    let glyph = font.glyphs.glyphs[glyphKey];
    if(glyph.unicode !== undefined && typeof String.fromCharCode(glyph.unicode) === 'string'
      && opts.loadFonts.indexOf(String.fromCharCode(glyph.unicode)) !== -1) {
      _this.chars.push({
        code: glyph.unicode,
        geometry: pathToShape(glyph.path, opts, THREE)
      });  
    }
  });
  opts.callback();
}

OpenTypeGeometry.prototype.resetGeometry = function(callback) {
  callback = callback || noop;
  this.chars = undefined;
  callback();
}

OpenTypeGeometry.prototype.loadOpenType = function(opts) {
  let _this = this;
  if(!opts.fontFace) throw new Error('opts fontface is not defined');
  // clean old font
  this.chars = undefined;
  defaults(opts, DEFAULT_OPTS);
  Object.assign(this, opts);
  opentype.load(this.fontFace, function(err, font) {
    _this.font = font;
    _this.fontFace = opts.fontFace;
    _this.callback();
  });
}

module.exports = OpenTypeGeometry
