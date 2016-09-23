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
  currentText: 'Enter Some text in dat.gui'
});
let textColor = new THREE.Color(0xff0000);
let currentFont = './assets/fonts/Pacifico.ttf';

let guiOpts = {
  text: 'Enter Some text in dat.gui',
  remoteFont: '',
  lineHeight: 1.2,
  width: 200,
  color: '#ff0000',
  letterSpacing: 0,
  load: () => {
    if(typeLayout.currentText) loadRemoteFont('./assets/fonts/' + currentFont)
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

let extrudeSettings = {
    amount: 20,
    steps: 1,
    material: 1,
    bevelThickness: 2,
    bevelSize: 4,
    bevelSegments: 1
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
    typeLayout.setText(guiOpts.text, {
      extrude: guiOpts.extrude ? extrudeSettings : undefined
    });
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
  extrudeOptions.add(extrudeSettings, 'bevelThickness', 2, 20).step(1);
  extrudeOptions.add(extrudeSettings, 'bevelSize', 2, 10).step(1);
  extrudeOptions.add(guiOpts, 'doExtrude').name('Extrude text');

  gui.addColor(guiOpts, 'color').onChange(() => {
    let colorSplit = guiOpts.color.split('#')[1];
    textColor = new THREE.Color(parseInt('0x' + colorSplit));
    guiOpts.changeColor();  
  });

  renderer.setClearColor(0xFFFFFF, 1.0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  light.intensity = 1;
  spotLight.intensity = 0.4;
  spotLight.position.x = 200;
  camera.add(light);
  camera.position.set(0,0,15000);
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
    extrude: extrudeSettings 
  });
  typeLayout.setText(guiOpts.text, {
    extrude: extrudeSettings
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
    fontFace: fontFace || './assets/fonts/Pacifico.ttf',
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
