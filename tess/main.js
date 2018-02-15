const W = 1280;
const H = 720;

let renderer, scene, camera;
let controls; // eslint-disable-line no-unused-vars

const clock = new THREE.Clock();

const positionsTextureRunner = new DynamicRenderTextureRunner();

const lineSubdivisions = 512; // power of two please
const numLines = 8; // power of two please

const uniforms = {
  time: {type: "f", value: 0.0},
  aspectRatio: {type: "f", value: W / H},
  uvSteps: {type: "2fv", value: [1.0 / lineSubdivisions, 1.0 / numLines]},

  positionsMap: {type: "t", value: null}
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

  uniforms.time.value += delta;
  
  requestAnimationFrame( loop );

  positionsTextureRunner.render();

  renderer.render( scene, camera );
  
}
