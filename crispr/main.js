import * as capture from '../vendor/capture.js';

import * as tilesaver from '../app/tilesaver.js';
import {initGui} from "../shared/generateGui.js";

const W = 1280;
const H = 720;

let RENDERING = false;
let TILES = 2;

let renderer, scene, camera;
let controls; // eslint-disable-line no-unused-vars

const clock = new THREE.Clock();

const numSteps = 40;

const uniforms = {
  time: {type: "f", value: 0.0, hideinGui: true},

  point0: {type: "3fv", value: [-3.0, -8.0, 0.0]},
  point1: {type: "3fv", value: [2.0, 3.0, 1.0]},
  point2: {type: "3fv", value: [1.0, 10.0, 3.0]},

  offsetDistance: {type: "f", value: 3.4},

  dotSize: {type: "f", value: 1.0},
  lineWeight: {type: "f", value: 0.02},

  windings: {type: "f", value: 3.0},
  rotationSpeed: {type: "f", value: 1.0},

  noiseOffset: {type: "f", value: 1.0},
  noiseScale: {type: "f", value: 0.1},
  noiseSpeed: {type: "f", value: 0.1},

  pointsFadeInner: {type: "3fv", value: [0.5, 0.5, 5.0001]},
  pointsFadeOuter: {type: "3fv", value: [0.5, 0.5, 5.0001]},

  linesFade: {type: "3fv", value: [0.5, 0.5, 5.0001]},

  colorGroup0A: {type: "3fv", value: [1.0, 1.0, 1.0], color: true},
  colorGroup0B: {type: "3fv", value: [0.8, 0.8, 0.8], color: true},

  colorGroup1A: {type: "3fv", value: [0.4, 0.4, 0.4], color: true},
  colorGroup1B: {type: "3fv", value: [0.2, 0.2, 0.2], color: true},
};

main();


function main() {
  setup(); // set up scene
  
  loop(); // start game loop
  
  tilesaver.init(renderer, scene, camera, TILES);
  initGui(uniforms);
}


function setup() {
  
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    // alpha: true
  });
  renderer.setSize( W, H );
  // renderer.setPixelRatio( window.devicePixelRatio );
  document.body.appendChild( renderer.domElement );
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, W / H, 0.01, 1000 );
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  camera.position.z = 20;

  const geometry = getInstancedDotGeometry(20, 0.2, numSteps);

  const centerDots = new THREE.Mesh(
    geometry,
    new THREE.RawShaderMaterial({
      vertexShader: crispr_dotVS,
      fragmentShader: crispr_dotFS,
      uniforms,
      // wireframe: true
    })
  );
  centerDots.frustumCulled = false;
  scene.add(centerDots);

  const offsetDots = new THREE.Mesh(
    geometry,
    new THREE.RawShaderMaterial({
      vertexShader: crispr_dotVS,
      fragmentShader: crispr_dotFS,
      uniforms,
      defines: {
        OFFSET_DOT: true
      }
      // wireframe: true
    })
  );
  offsetDots.frustumCulled = false;
  scene.add(offsetDots);

  const lines = new THREE.Mesh(
    getInstancedLineGeometry(1.0, numSteps),
    new THREE.RawShaderMaterial({
      vertexShader: crispr_lineVS,
      fragmentShader: crispr_dotFS,
      uniforms,
      side: THREE.DoubleSide,
      // wireframe: true
    })
  );
  lines.frustumCulled = false;
  scene.add(lines);

  onResize();
  window.addEventListener("resize", onResize);

  clock.start();
}

function onResize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}


function loop(time) { // eslint-disable-line no-unused-vars

  const delta = Math.min(1.0 / 20.0, clock.getDelta());

  if (!RENDERING) {
    uniforms.time.value += delta;
    requestAnimationFrame(loop);
  }

  renderer.render( scene, camera );
  capture.update( renderer );
}

document.addEventListener('keydown', e => {
  if (e.key == ' ') {
    console.log('space');
    RENDERING = !RENDERING;
  } else if (e.key == 'e') {
    tilesaver.save().then(
      (f) => {
        console.log(`Saved to: ${f}`);
        loop();
      }
    );
  } else if (e.key == 'f') { // f .. fullscreen
    if (!document.webkitFullscreenElement) {
      document.querySelector('body').webkitRequestFullscreen();
    } else { document.webkitExitFullscreen(); }
  }
  
  else if (e.key == 'c') {
    capture.startstop(); // start/stop recording
  }
  else if (e.key == 'v') {
    capture.startstop( {startTime:0, timeLimit:1} ); // record 1 second
  }
});
