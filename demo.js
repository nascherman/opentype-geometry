const opentype = require('opentype.js');
const computeLayout = require('opentype-layout');
const pathToShape = require('./util/pathToShape');
const THREE = require('three');

const OrbitControls = require('three-orbit-controls')(THREE);

let renderer = new THREE.WebGLRenderer();
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000 );
// let ambientLight = new THREE.AmbientLight(0x0c0c0c);
let light = new THREE.PointLight( 0xffffff );
let spotLight = new THREE.SpotLight( 0xffffff );

require('domready')(function() {
  createScene(render);
});

function noop() {}

function createScene(callback) {
  let canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var controls = new OrbitControls( camera,  canvas );
  canvas.appendChild(renderer.domElement);

  renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMapEnabled = true;

  opentype.load('./demo/fonts/Pacifico.ttf', (err, font) => {
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
        geometry: pathToShape(glyph.data.path, {
          extrude: {
              amount: 1000,
              steps: 1000,
              bevelEnabled    : true,
              bevelThickness  : 1000,
              bevelSize       : 1000,
              bevelSegments   : 4,
          }
        }, THREE)
      };
    });
    console.log(glyphGeometry);
    let xOffset = 0;

    light.intensity = 0.5;
    spotLight.intensity = 0.7;
    spotLight.position.x = 200;
    camera.add( light );
    camera.position.z = 10000;
    camera.position.x += 1000;
    camera.add( spotLight );
    scene.add(camera);

    glyphGeometry.forEach((glyph) => {
      let mesh = new THREE.Mesh(
        glyph.geometry, 
        new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false }) 
      );
      mesh.position.x = glyph.position[0];
      mesh.position.y = glyph.position[1];
      
      scene.add(mesh);
    });

    if(callback) callback();
  });
  javascript:(function() {
    var script=document.createElement('script');
    script.onload= function(){
      var stats=new Stats();
      document.body.appendChild(stats.dom);
      requestAnimationFrame(function loop(){
        stats.update();
        requestAnimationFrame(loop)
      });
    };
    script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';
    document.head.appendChild(script);
  })();

}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}
