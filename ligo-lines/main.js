import * as tilesaver from '../app/tilesaver.js';
import generateGui from "../shared/generateGui.js";
import PingPongRunner from "../shared/pingPongRunner.js";

import ligoPlaneVS from "../shaders/ligoPlaneVS.js";
import ligoPlaneFS from "../shaders/ligoPlaneFS.js";

const W = 1280;
const H = 720;

let RENDERING = false;
let TILES = 2;

let renderer, scene, camera;
let controls; // eslint-disable-line no-unused-vars

const clock = new THREE.Clock();

const heightPingPong = new PingPongRunner();

const renderResolutionX = 1024;
const renderResolutionY = 1024;

let frameRequest;

const uniforms = {
  time: {type: "f", value: 0.0, hideinGui: true},
  aspectRatio: {type: "f", value: W / H, hideinGui: true},
  computeResolution: {type: "2fv", value: [1.0 / renderResolutionX, 1.0 / renderResolutionY], hideinGui: true},


  uvScale: {type: "2fv", value: [1.0, 1.0], min: 0.0, max: 10.0, step: 0.0001},
  uvRotation: {type: "f", value: 0.0, min: -Math.PI, max: Math.PI, step: 0.0001},
  uvTranslate: {type: "2fv", value: [0.0, 0.0], min: -5.0, max: 5.0, step: 0.0001},

  dotEffect: {type: "f", value: 3.0},

  attack: {type: "f", value: 2.0},
  decay: {type: "f", value: 0.999},
  engeryReduce: {type: "f", value: 0.9999, min: 0.1, max: 2.0, step: 0.0001},

  displaceGain: {type: "f", value: 0.13, min: 0.0, max: 2.0, step: 0.0001},
  displaceHeight: {type: "f", value: 0.1, min: -2.0, max: 2.0, step: 0.0001},

  numLines: {type: "f", value: 50.0},
  lineWeight: {type: "f", value: 0.05, min: 0.0, max: 0.1, step: 0.0001},
  lineSmoothness: {type: "f", value: 2.0, min: 0.0, max: 10.0, step: 0.0001},

  pointSize: {type: "f", value: 0.01},

  cornerEffect: {type: "f", value: 0.75},
  averageDivider: {type: "f", value: 7.00001},

  colorEdge: {type: "f", value: 0.0,  min: -1.0, max: 1.0, step: 0.0001},
  colorEdgeWidth: {type: "f", value: 0.1}, min: -0.2, max: 0.2, step: 0.0001,

  pointPositions: {
    type: "v3v",
    value: [
      new THREE.Vector3( 0.5, 0.8, 0.0 ), 
      new THREE.Vector3( 0.5, 0.5, 0.0 )
    ]
  },

  pointFrequencies: {
    type: "2fv",
    value: [
      0.3,
      0.4
    ]
  },
  pointOnDurations: {
    type: "2fv",
    value: [
      0.05,
      0.05
    ]
  }
};

main();


function main() {
  
  setup(); // set up scene
  
  loop(); // start game loop

  tilesaver.init(renderer, scene, camera, TILES);
  generateGui(uniforms);
}


function setup() {
  
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    // alpha: false
  });
  renderer.setSize( W, H );
  renderer.setPixelRatio( window.devicePixelRatio );
  document.body.appendChild( renderer.domElement );
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, W / H, 0.01, 1000 );
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  camera.position.z = 20;

  heightPingPong.setup(
    camera,
    renderer,
    fullscreenVS,
    computeHeightFS,
    uniforms,
    {
      NUM_POINTS: uniforms.pointPositions.value.length
    },
    renderResolutionX,
    renderResolutionY
  );

  const waves = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(20.0, 20.0, 253, 253),
    new THREE.RawShaderMaterial({
      vertexShader: ligoPlaneVS,
      fragmentShader: ligoPlaneFS,
      uniforms,
      side: THREE.DoubleSide,
      transparent: true,
      // wireframe: true
      depthTest: false,
      depthWrite: false,
    })
  );
  waves.frustumCulled = false;
  scene.add(waves);

  onResize();
  window.addEventListener("resize", onResize);

  clock.start();
}

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  camera.aspect = window.innerWidth / window.innerHeight;
  uniforms.aspectRatio.value = camera.aspect;
  camera.updateProjectionMatrix();
}


function loop(time) { // eslint-disable-line no-unused-vars

  const delta = Math.min(1.0 / 20.0, clock.getDelta());

  if (!RENDERING) {
    uniforms.time.value += delta;

    for (let i = 0, l = uniforms.pointPositions.value.length; i < l; i++) {
      uniforms.pointPositions.value[i].z = 
        uniforms.time.value % uniforms.pointFrequencies.value[i] < uniforms.pointOnDurations.value[i] ? 1.0 : 0.0;
    }
  }
  
  if (!RENDERING) {
    frameRequest = requestAnimationFrame( loop );
  }

  heightPingPong.render();
  renderer.render( scene, camera );
  
}

document.addEventListener('keydown', e => {
  if (e.key == ' ') {
    console.log('space');
    RENDERING = !RENDERING;

    if (!RENDERING) {
      cancelAnimationFrame(frameRequest);
      loop;
    }
  } else if (e.key == 'e') {
    tilesaver.save().then(
      (f) => {
        console.log(`Saved to: ${f}`);
        onResize();

        cancelAnimationFrame(frameRequest);
        loop();
      }
    );
  }
});
