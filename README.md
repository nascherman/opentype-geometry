# opentype-geometry
Convert opentype to geometry. Based on the [opentype-layout](https://www.npmjs.com/package/opentype-layout) module.

You can convert ttf files to threejs geometry to be made into a mesh like so.
```javascript
  let typeLayout = new OpenTypeGeometry();

  typeLayout.loadOpenType({
    fontFace: fontFace || './demo/fonts/Pacifico.ttf',
    fontSizePx: 16,
    lineHeight: guiOpts.lineHeight,
    width: guiOpts.width,
    letterSpacing: guiOpts.letterSpacing,
    callback: function() {
      typeLayout.setText('Some text');
      typeLayout.currentText.forEach((glyph) => {
      let mesh = new THREE.Mesh(
        glyph.geometry.geometry, 
        new THREE.MeshPhongMaterial( { color: textColor, wireframe: false }) 
      );
      mesh.position.x = glyph.position[0];
      mesh.position.y = glyph.position[1];
      scene.add(mesh);
    });
  })
```

## Install 

Best used with npm and browserify. This should also work in Node.js and other environments.

```sh
npm install opentype-geometry --save
```
## Demo 

[Live Demo](http://nascherman.github.io/open-type-layout/)


