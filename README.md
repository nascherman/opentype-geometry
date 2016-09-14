# opentype-geometry
Convert opentype to geometry. Based on the [opentype-layout](https://www.npmjs.com/package/opentype-layout) module.

You can convert ttf files to threejs geometry to be made into a mesh like so.
```javascript
  let typeLayout = new OpenTypeGeometry();

  typeLayout.loadOpenType({
    fontFace: './demo/fonts/Pacifico.ttf',
    fontSizePx: 16,
    lineHeight: 2,
    width: 100,
    letterSpacing: 1.1,
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

```sh
npm install opentype-geometry --save
```
## Demo 

[Live Demo](https://opentype-geometry.herokuapp.com/)


