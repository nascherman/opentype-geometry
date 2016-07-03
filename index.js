const opentype = require('opentype.js');
const computeLayout = require('opentype-layout');
const pathToShape = require('./util/pathToShape');
const defaults = require('lodash.defaults');
const THREE = require('three');

module.exports = function createText(opts) {

  defaults(opts, {
    fontSize: 72,
    text: 'No text',
    extrude: {
      amount: 1000,
      steps: 1000,
      bevelEnabled    : true,
      bevelThickness  : 100,
      bevelSize       : 100,
      bevelSegments   : 4
    },
    fontFace: './demo/fonts/Pacifico.ttf'
  });

  opentype.load(opts.fontFace, (err, font) => {
    if (err) throw err;
  
    let fontSizePx = 72;
    let text = 'Hello World! This box should start word-wrapping!\n' +
      'Symbols !@#$%^&*()__+{}'
    let scale = 1 / font.unitsPerEm * fontSizePx;
    // Layout some text - notice everything is in em units!
    let result = computeLayout(font, text, {
      lineHeight: 2 * font.unitsPerEm, // '2.5em' in font units
      width: 600 / scale // '500px' in font units
    });
    let glyphGeometry = result.glyphs.map((glyph) => {
      return {
        position: glyph.position,
        row: glyph.row,
        index: glyph.index,
        geometry: pathToShape(glyph.data.path, opts, THREE)
      };
    });
    
    return glyphGeometry;
  });
}
