const THREE = require('three');
const OpenTypeGeometry = require('./');
const Colors = require('nice-color-palettes');

let renderer = new THREE.WebGLRenderer({
  antialias: true
});
let scene = new THREE.Scene();
let container = new THREE.Object3D();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 100000 );
let ambientLight = new THREE.AmbientLight(0xffffff);
let light = new THREE.PointLight( 0xffffff );
let spotLight = new THREE.SpotLight( 0xffffff );
let OrbitControls = require('three-orbit-controls')(THREE);

let typeLayout = new OpenTypeGeometry({
  currentText: 'Type some text here!'
});
let textColor = new THREE.Color(0x000000);
let currentFont = './demo/fonts/Pacifico.ttf';

let guiOpts = {
  text: 'Type some text here!',
  remoteFont: '',
  lineHeight: 1.2,
  width: 150,
  letterSpacing: 0,
  extrude: false,
  load: () => {
    if(typeLayout.currentText) loadRemoteFont('./demo/fonts/' + currentFont)
  },
  doExtrude: () => {
    typeLayout.resetGeometry(() => {
      changeLayout();
    });
  },
  changeColor: () => {
    clearText();
    layoutText();
  }
};

Object.keys(Colors).forEach((key) => {
  Colors[key].forEach((color) => {
    guiOpts[color.toString()] = color;
  });
});

let extrudeSettings = {
    amount: 20,
    steps: 1,
    material: 1,
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 4,
    bevelSegments: 1,   
};

let fonts = ['DejaVuSans.ttf', 'Lobster.ttf', 'Pacifico.ttf', 
  'Pecita.otf', 'firstv2.ttf', 'ipag.ttf', 'spaceAge.otf', 'tngan.ttf'];

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
  let fontOptions = gui.addFolder('Font options');
  fonts.forEach((font) => {
    fontOptions.add(guiOpts, 'load').name(font)
      .onChange(() => {
        currentFont = font;
        guiOpts.load();
      })
  });

  gui.add(guiOpts, 'lineHeight', 0.5, 4).onChange(() =>  {
    changeLayout();
  });
  gui.add(guiOpts, 'width', 10, 150).onChange(() => {
    changeLayout();
  });
  gui.add(guiOpts, 'letterSpacing', 0, 2).onChange(() => {
    changeLayout();
  });
  let extrudeOptions = gui.addFolder('Extrude Options');
  extrudeOptions.add(extrudeSettings, 'amount', 20, 2000).step(1);
  extrudeOptions.add(extrudeSettings, 'steps', 1, 20).step(1);
  extrudeOptions.add(extrudeSettings, 'bevelEnabled');
  extrudeOptions.add(extrudeSettings, 'bevelThickness', 2, 20).step(1);
  extrudeOptions.add(extrudeSettings, 'bevelSize', 2, 10).step(1);
  extrudeOptions.add(guiOpts, 'extrude');
  extrudeOptions.add(guiOpts, 'doExtrude').name('Extrude text');

  let colorOptions = gui.addFolder('Color Options');
  Object.keys(Colors).forEach((key) => {
    Colors[key].forEach((color) => {
      let colorSplit = color.split('#')[1];

      colorOptions.addColor(guiOpts, color).onChange(() => {
        textColor = new THREE.Color(parseInt('0x' + colorSplit));
        guiOpts.changeColor();
      });
    });
  });

  renderer.setClearColor(0xFFFFFF, 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  light.intensity = 1;
  spotLight.intensity = 0.4;
  spotLight.position.x = 200;
  camera.add(light);
  camera.position.set(0,0,15000);
  camera.rotation.y = Math.PI;
  container.position.x = -8000;
  container.position.y = 5000;
  camera.add( spotLight );
  scene.add(camera);
  const controls = new OrbitControls(camera, canvas)
  
  scene.add(container);
  typeLoad();
  stats();
  callback();
}

function changeLayout() {
  clearText();
  typeLayout.updateLayout({
    width: guiOpts.width,
    letterSpacing: guiOpts.letterSpacing,
    lineHeight: guiOpts.lineHeight,
    extrude: guiOpts.extrude ? extrudeSettings : undefined 
  });
  typeLayout.setText(guiOpts.text, {
    extrude: guiOpts.extrude ? extrudeSettings : undefined 
  });
  layoutText();
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
      new THREE.MeshPhongMaterial( { color: textColor, wireframe: false }) 
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
