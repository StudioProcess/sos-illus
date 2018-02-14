const W = 1280;
const H = 720;

let renderer, scene, camera;
let controls; // eslint-disable-line no-unused-vars

const clock = new THREE.Clock();

const numSteps = 20;

const uniforms = {
  time: {type: "f", value: 0.0},

  point0: {type: "3fv", value: [-3.0, -2.0, 0.0]},
  point1: {type: "3fv", value: [2.0, 3.0, 1.0]},
  point2: {type: "3fv", value: [1.0, 6.0, 3.0]},

  offsetDistance: {type: "f", value: 5.0},

  windings: {type: "f", value: 3.0},
};

main();


function main() {
  
  setup(); // set up scene
  
  loop(); // start game loop
  
}


function setup() {
  
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
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

  uniforms.time.value += delta;
  
  requestAnimationFrame( loop );
  renderer.render( scene, camera );
  
}
