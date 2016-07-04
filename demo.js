const THREE = require('three');
const OpenTypeGeometry = require('./');

let renderer = new THREE.WebGLRenderer();
let scene = new THREE.Scene();
let container = new THREE.Object3D();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000 );
let ambientLight = new THREE.AmbientLight(0xffffff);
let light = new THREE.PointLight( 0xffffff );
let spotLight = new THREE.SpotLight( 0xffffff );
let OrbitControls = require('three-orbit-controls')(THREE);

let typeLayout = new OpenTypeGeometry();
loadFonts = [
  'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v',
  'w','x','y','z',' '
];
loadFonts = loadFonts.concat(loadFonts.map((char) => { return char.toUpperCase() }))
.concat(['!','@','#','$','%','^','&','*','(',')','_','-','=','+','{','[','}','\'','\"',
  ';',':','/','?','\\','>','.',',','<','`','~','|'],'1','2','3','4','5','6','7','8','9','0');  

let guiOpts = {
  text: 'Type some text here!',
  remoteFont: '',
  lineHeight: 1.2,
  width: 150,
  letterSpacing: 0,
  extrude: false,
  extrudeSettings: {},
  load: () => {
     loadRemoteFont(guiOpts.remoteFont)
  }
}

require('domready')(function() {
  createScene(render);
});

function noop() {}

function createScene(callback) {
  let canvas = document.getElementById('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.appendChild(renderer.domElement);

  let gui = new dat.GUI( {
    height: 5 * 32
  })

  gui.add(guiOpts, 'text').onChange(function() {
    clearText();
    typeLayout.setText(guiOpts.text);
    layoutText();
  });
  gui.add(guiOpts, 'remoteFont').name('Remote .ttf/.otf/.woff url (cdn)'); 
  gui.add(guiOpts, 'load').name('Click to load');
  gui.add(guiOpts, 'lineHeight', 0.5, 4).onChange(() =>  {
    changeLayout();
  });
  gui.add(guiOpts, 'width', 10, 150).onChange(() => {
    changeLayout();
  });
  gui.add(guiOpts, 'letterSpacing', 0, 2).onChange(() => {
    changeLayout();
  });
  gui.add(guiOpts, 'extrude').onChange(() => {
    typeLayout.resetGeometry(() => {
      if(guiOpts.extrude) {
        guiOpts.extrudeSettings = {
          amount: 100,
          steps: 5,
          bevelEnabled: true,
          bevelThickness: 15,
          bevelSize: 10,
          bevelSegments: 3
        }
      }
      else {
        guiOpts.extrudeSettings = {}
      }
      changeLayout();
    });
  });

  renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  light.intensity = 1;
  spotLight.intensity = 1;
  spotLight.position.x = 200;
  camera.add(light);
  camera.position.set(0,0,15000);
  camera.rotation.y = Math.PI;
  container.position.x = -8000;
  container.position.y = 5000;
  camera.add( spotLight );
  scene.add(camera);
  controls = new OrbitControls(camera, canvas)
  
  scene.add(container);
  typeLoad();
  stats();
  callback();

  function changeLayout() {
    clearText();
    typeLayout.updateLayout({
      width: guiOpts.width,
      letterSpacing: guiOpts.letterSpacing,
      lineHeight: guiOpts.lineHeight,
      extrude: guiOpts.extrude ? guiOpts.extrudeSettings : undefined 
    });
    typeLayout.setText(guiOpts.text, {
      extrude: guiOpts.extrudeSettings
    });
    layoutText();
  }
}

function clearText() {
  typeLayout.currentText.forEach((glyph) => {
    container.remove(glyph.mesh);
  });
}

function typeLoad(fontFace)  {
  typeLayout.loadOpenType({
    fontFace: fontFace || './demo/fonts/Pacifico.ttf',
    fontSizePx: 16,
    lineHeight: guiOpts.lineHeight,
    width: guiOpts.width,
    letterSpacing: guiOpts.letterSpacing,
    loadFonts: loadFonts,
    callback: function() {
      typeLayout.setText(guiOpts.text);
      layoutText();
    }
  });
}

function layoutText() {
  typeLayout.currentText.forEach((glyph) => {
    let mesh = new THREE.Mesh(
      glyph.geometry.geometry, 
      new THREE.MeshPhongMaterial( { color: 0x000000, wireframe: false }) 
    );
    mesh.position.x = glyph.position[0];
    mesh.position.y = glyph.position[1];
    glyph.mesh = mesh;
    container.add(mesh);
  });
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function stats() {
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

function loadRemoteFont(url) {
  if(url.length <= 0) return;
  typeLayout.currentText.forEach((glyph) => {
    container.remove(glyph.mesh);
  });
  typeLoad(url);
}
