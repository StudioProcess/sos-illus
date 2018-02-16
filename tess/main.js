import * as tilesaver from '../app/tilesaver.js';
import generateGui from "../shared/generateGui.js";

const W = 1280;
const H = 720;

let RENDERING = false;
let TILES = 2;

let renderer, scene, camera;
let controls; // eslint-disable-line no-unused-vars

const clock = new THREE.Clock();

const positionsTextureRunner = new DynamicRenderTextureRunner();

const lineSubdivisions = 1024; // power of two please
const numLines = 8; // power of two please

const uniforms = {
  time: {type: "f", value: 0.0, hideinGui: true},
  aspectRatio: {type: "f", value: W / H, hideinGui: true},
  uvSteps: {type: "2fv", value: [1.0 / lineSubdivisions, 1.0 / numLines], hideinGui: true},

  noiseSpeed: {type: "f", value: 0.1, min: 0.0, max: 2.0, step: 0.001},
  noiseScale: {
    type: "2fv",
    value: [30.0, 100.0],
    gui: [
      {name: "x", min: 0.0, max: 200.0, step: 0.001},
      {name: "y", min: 0.0, max: 200.0, step: 0.001},
    ]
  },

  lineSizes: {
    type: "2fv",
    value: [20.0, 20.0],
    gui: [
      {name: "x", min: 0.0, max: 20.0, step: 0.001},
      {name: "y", min: 0.0, max: 20.0, step: 0.001},
    ]
  },

  lineWeight: {type: "f", value: 0.05},

  noiseAmount: {
    type: "2fv",
    value: [0.2, 1.4],
    gui: [
      {name: "base", min: 0.0, max: 4.0, step: 0.001},
      {name: "yplanet", min: 0.0, max: 4.0, step: 0.001},
    ]
  },

  planetPos: {type: "f", value: 0.5, min: 0.0, max: 1.0, step: 0.001},
  planetWidth: {type: "f", value: 0.05, min: 0.0, max: 0.2, step: 0.001},
  planetBaseOffset: {type: "f", value: 4.0, min: 0.0, max: 10.0, step: 0.001},

  positionsMap: {type: "t", value: null}
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
  // renderer.setPixelRatio( window.devicePixelRatio );
  document.body.appendChild( renderer.domElement );
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75, W / H, 0.01, 1000 );
  controls = new THREE.OrbitControls( camera, renderer.domElement );
  camera.position.z = 20;

  uniforms.positionsMap.value = positionsTextureRunner.setup(
    camera,
    renderer,
    fullscreenVS,
    linePointsComputeFS,
    uniforms,
    lineSubdivisions,
    numLines
  );

  const lines = new THREE.Mesh(
    getInstancedLineGeometry(
      lineSubdivisions,
      numLines
    ),
    new THREE.RawShaderMaterial({
      vertexShader: tessLineVS,
      fragmentShader: tessLineFS,
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

  positionsTextureRunner.render();
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
