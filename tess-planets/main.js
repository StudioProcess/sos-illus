import * as tilesaver from '../app/tilesaver.js';
import {initGui, addThreeV3Slider} from "../shared/generateGui.js";

import vertexShader from "../shaders/tessPlanetVS.js";
import fragmentShader from "../shaders/tessPlanetFS.js";

const W = 1280;
const H = 720;

let RENDERING = false;
let TILES = 2;

let renderer, scene, camera;
let controls; // eslint-disable-line no-unused-vars

const clock = new THREE.Clock();

let gui;

// const numDots = Math.floor(lineSubdivisions / 6);

const uniforms = {
  time: {type: "f", value: 0.0, hideinGui: true},
  aspectRatio: {type: "f", value: W / H, hideinGui: true},

  radius: {type: "f", value: 7.5, step: 0.1},
  displacementDistance: {type: "f", value: 1.4, step: 0.01},

  innerRadius: {type: "f", value: 6.0, step: 0.1},
  innerDisplacementDistance: {type: "f", value: 0.8, step: 0.01},

  noiseSpeed: {type: "f", value: 0.1, step: 0.001},
  noiseScale: {type: "f", value: 2.0, step: 0.01},
  noiseMinValue: {type: "f", value: -0.2, min: -1.0, max: 1.0, step: 0.01},

  lineStepSize: {type: "f", value: 0.1, min: 0.0, step: 0.01},
  lineWeight: {type: "f", value: 0.005, min: 0.0, step: 0.001},
  lineSmoothing: {type: "f", value: 4.0, min: 0.0, step: 0.001},

  facingCull: {type: "f", value: -0.7, min: -1.0, max: 1.0, step: 0.001},
  facingCullWidth: {type: "f", value: 0.5, min: 0.0, step: 0.001},

  outerOpacity:  {type: "f", value: 0.55, min: 0.0, max: 1.0, step: 0.001},
  innerOpacity:  {type: "f", value: 0.7, min: 0.0, max: 1.0, step: 0.001},
};

main();


function main() {
  gui = initGui(uniforms);

  setup(); // set up scene

  loop(); // start game loop

  tilesaver.init(renderer, scene, camera, TILES);
}


function setup() {
  
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    // alpha: false
  });
  renderer.setSize( W, H );
  // renderer.setPixelRatio( window.devicePixelRatio );
  document.body.appendChild( renderer.domElement );
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, W / H, 0.01, 1000 );
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  camera.position.z = 20;

  const geometry = new THREE.IcosahedronBufferGeometry(1.0, 7);
  const outerMaterial = new THREE.RawShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    
    side: THREE.DoubleSide,
    // wireframe: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
  });

  const innerMaterial = new THREE.RawShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide,
    // wireframe: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    defines: {
      INNER: true
    }
  });

  const planetInner = new THREE.Mesh(
    geometry,
    innerMaterial
  );
  planetInner.frustumCulled = false;
  scene.add(planetInner);

  // addThreeV3Slider(gui, planetInner.position, "planet Position");

  const planet = new THREE.Mesh(
    geometry,
    outerMaterial
  );
  planet.frustumCulled = false;
  scene.add(planet);

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
  }
  
  if (!RENDERING) {
    requestAnimationFrame(loop);
  }
  renderer.render( scene, camera );
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
  }
});
