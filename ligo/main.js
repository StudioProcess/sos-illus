import * as tilesaver from '../app/tilesaver.js';

const W = 1280;
const H = 720;

let RENDERING = false;
let TILES = 2;

let renderer, scene, camera;
let controls; // eslint-disable-line no-unused-vars

const clock = new THREE.Clock();

const heightPingPong = new PingPongRunner();

const renderResolutionX = 512;
const renderResolutionY = 512;

const uniforms = {
  time: {type: "f", value: 0.0},
  aspectRatio: {type: "f", value: W / H},
  computeResolution: {type: "2fv", value: [1.0 / renderResolutionX, 1.0 / renderResolutionY]},


  attack: {type: "f", value: 0.1},
  decay: {type: "f", value: 0.9},

  pointSize: {type: "f", value: 0.005},

  pointPositions: {
    type: "v3v",
    value: [
      new THREE.Vector3( 0.5, 0.5, 0.3 ), 
      new THREE.Vector3( 0.0, 0.8, 0.6 )
    ]
  }
};

main();


function main() {
  
  setup(); // set up scene
  
  loop(); // start game loop
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
    new THREE.PlaneBufferGeometry(2.0, 2.0),
    new THREE.RawShaderMaterial({
      vertexShader: fullscreenVS,
      fragmentShader: wavesFS,
      uniforms,
      side: THREE.DoubleSide,
      // wireframe: true
    })
  );
  waves.frustumCulled = false;
  scene.add(waves);

  onResize();
  window.addEventListener("resize", onResize);

  clock.start();

  tilesaver.init(renderer, scene, camera, TILES);
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
      uniforms.pointPositions.value[i].x = uniforms.time.value % 0.3 < 0.05 ? 0.5 : -2.0;
    }
  }
  
  if (!RENDERING) {
    requestAnimationFrame( loop );
  }

  heightPingPong.render();
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
        // loop();
      }
    );
  }
});
