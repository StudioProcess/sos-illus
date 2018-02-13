const DynamicRenderTextureRunner = (function() {
  function DynamicRenderTextureRunner() {
    this.skipPostProcessing = false;
  }

  DynamicRenderTextureRunner.prototype.setup = function(
    scene,
    camera,
    renderer,
    vertexShader,
    fragmentShader,
    uniforms,
    resolutionX,
    resolutionY,
    geometry = new THREE.PlaneBufferGeometry(2.0, 2.0, 1, 1), skipPostProcessing = false) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    
    this.renderTarget = new THREE.WebGLRenderTarget(resolutionX, resolutionY);
    Object.assign(uniforms, {
      sceneMap: {
        type: "t",
        value: this.renderTarget.texture
      }
    });
    this.outputMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms,
    });
    this.outputScene = new THREE.Scene();
    this.outputScene.add(new THREE.Mesh(geometry, this.outputMaterial));
  };

  DynamicRenderTextureRunner.prototype.render = function() {
    if (this.skipPostProcessing) {
      this.renderer.render(this.scene, this.camera);
    }
    else {
      this.renderer.render(this.scene, this.camera, this.renderTarget);
      this.renderer.render(this.outputScene, this.camera);
    }
  };

  return DynamicRenderTextureRunner;
})();
