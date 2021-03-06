const assign = require('object-assign');
const toSvg = require('./glyphToSvgPath');
const transformSVGPath = require('./transformSvgPath');
const defaults = require('lodash.defaults');
const simplify = require('simplify-path');
var parse = require('parse-svg-path');

function svgPathsToShape (path, opts, THREE) {
  // a little extrusion by default
  let extrudeSettings = defaults(opts.extrude, {
    amount: 20,
    steps: 1,
    material: 1,
    extrudeMaterial: 0,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 4,
    bevelSegments: 1
  });

  let geo = new THREE.Geometry();
  let svgPaths = toSvg(path);
  svgPaths = svgPaths.replace(/M/gi, ';M');
  svgPaths = svgPaths.split(';');
  let shapeGeo = [];
  let shapes = [];
  let mergedGeo = [];

  svgPaths.forEach((path, i) => {
    if(path.length === 0) return;
    let shapePath = transformSVGPath(path, THREE);
    if(!(shapePath.actions.length === 1 && shapePath.actions.args === undefined)) {
      shapePath.index = i;
      shapes.push(shapePath);
      shapeGeo.push(new THREE.ShapeGeometry(shapes[i-1]));
    }
  });

  shapeGeo.forEach((geo) => {
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
  });

  let foundHole;
  let merged = [];
  shapes.forEach((shape, i) => {
    let bounds = shapeGeo[i].boundingBox;
    shapeGeo.forEach((geo, j) => {
      if(j === i) return;
      if(bounds.max.x > geo.boundingBox.max.x && bounds.max.y > geo.boundingBox.max.y &&
        bounds.min.x < geo.boundingBox.min.x && bounds.min.y < geo.boundingBox.min.y) {
        shape.holes.push(shapes[j]);
        merged.push(shapes[j])
        merged.push(shapes[i])
      }
    });

    if(shape.holes.length > 0) {
      foundHole = true;
      let newShape = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.merge(newShape);
    }
    
  });
  if(!foundHole) {
    shapes.forEach((shape) => { 
      let newShape = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geo.merge(newShape);
    });
  }
  else {
    shapes.forEach((shape) => {
      let foundShape = false;
      merged.forEach((mergedShape) => {
        if(mergedShape.index === shape.index) 
          foundShape = true;
      });
      if(foundShape === false) {
        let newShape = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.merge(newShape);
      }
    })
  }

  return geo;
}

module.exports = svgPathsToShape;
