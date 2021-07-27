let keysDown = {87:false, 83:false, 65:false, 68:false, 67:false, 69:false};
let walkspeed = 2.5;//How many meters per second
let movelr = 0;//Moving left/right
let movefb = 0;//Moving forward/backward
let moveud = 0;//Moving up/down
let keyboardDebugging = false;

/**
 * React to a key being pressed
 * @param {keyboard callback} evt 
 */
  function keyDown(evt) {
  let newKeyDown = false;
  if (evt.keyCode == 87) { //W
      if (!keysDown[87]) {
          newKeyDown = true;
          keysDown[87] = true;
          movefb = 1;
      }
  }
  else if (evt.keyCode == 83) { //S
      if (!keysDown[83]) {
          newKeyDown = true;
          keysDown[83] = true;
          movefb = -1;
      }
  }
  else if (evt.keyCode == 65) { //A
      if (!keysDown[65]) {
          newKeyDown = true;
          keysDown[65] = true;
          movelr = -1;
      }
  }
  else if (evt.keyCode == 68) { //D
      if (!keysDown[68]) {
          newKeyDown = true;
          keysDown[68] = true;
          movelr = 1;
      }
  }
  else if (evt.keyCode == 67) { //C
      if (!keysDown[67]) {
          newKeyDown = true;
          keysDown[67] = true;
          moveud = -1;
      }
  }
  else if (evt.keyCode == 69) { //E
      if (!keysDown[69]) {
          newKeyDown = true;
          keysDown[69] = true;
          moveud = 1;
      }
  }
}

/**
 * React to a key being released
 * @param {keyboard callback} evt 
 */
function keyUp(evt) {
  if (evt.keyCode == 87) { //W
      movefb = 0;
      keysDown[87] = false;
  }
  else if (evt.keyCode == 83) { //S
      movefb = 0;
      keysDown[83] = false;
  }
  else if (evt.keyCode == 65) { //A
      movelr = 0;
      keysDown[65] = false;
  }
  else if (evt.keyCode == 68) { //D
      movelr = 0;
      keysDown[68] = false;
  }
  else if (evt.keyCode == 67) { //C
      moveud = 0;
      keysDown[67] = false;
  }
  else if (evt.keyCode == 69) { //E
      moveud = 0;
      keysDown[69] = false;
  }
}    


document.addEventListener('keydown', keyDown.bind(this), true);
document.addEventListener('keyup', keyUp.bind(this), true);


// Get config from URL
var config = (function() {
  var config = {};
  var q = window.location.search.substring(1);
  if (q === '') {
    return config;
  }
  var params = q.split('&');
  var param, name, value;
  for (var i = 0; i < params.length; i++) {
    param = params[i].split('=');
    name = param[0];
    value = param[1];

    // All config values are either boolean or float
    config[name] = value === 'true' ? true :
                   value === 'false' ? false :
                   parseFloat(value);
  }
  return config;
})();

// Mock VRFrameData for VRControls
function VRFrameData () {
  this.leftViewMatrix = new Float32Array(16);
  this.rightViewMatrix = new Float32Array(16);
  this.leftProjectionMatrix = new Float32Array(16);
  this.rightProjectionMatrix = new Float32Array(16);
  this.pose = null;
};

console.log('creating CardboardVRDisplay with options', config);
var vrDisplay = new CardboardVRDisplay(config);

navigator.getVRDisplays = function () {
  return new Promise(function (resolve) {
    resolve([vrDisplay]);
  });
};

var canvas = document.querySelector('canvas');
// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
var renderer = new THREE.WebGLRenderer({antialias: true, canvas: canvas});
renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

// Create a three.js scene.
var scene = new THREE.Scene();

// Create a three.js camera.
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

// Apply VR headset positional data to camera.
var controls = new THREE.VRControls(camera);

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);

// Skipping skybox grid

// Kick off the render loop.
vrDisplay.requestAnimationFrame(animate);

// Create 3D objects.
var cubeGeometry = new THREE.BoxGeometry(5, 5, 5); // three.js line 29094
var sphereGeometry = new THREE.SphereGeometry(4, 32, 32); //three.js line 29075
var material = new THREE.MeshPhongMaterial({ color: 0xCD853F });
var cube = new THREE.Mesh(cubeGeometry, material);
var cube2 = new THREE.Mesh(cubeGeometry, material);
var sphere = new THREE.Mesh(sphereGeometry, material);

// create arToolkitSource
arToolkitSource = new THREEx.ArToolkitSource({
    sourceType : 'webcam',
});

function onResize()
{
    arToolkitSource.onResize()	
    arToolkitSource.copySizeTo(renderer.domElement)	
    if ( arToolkitContext.arController !== null )
    {
        arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
    }	
}

arToolkitSource.init(function onReady(){
    onResize()
});

// handle resize event
window.addEventListener('resize', function(){
    onResize()
});

// create arToolkitContext
arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: 'data/camera_para.dat',
    detectionMode: 'mono'
});

// copy projection matrix to camera when initialization complete
arToolkitContext.init();// function onCompleted(){
//    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
//});

// Adding the AR markerControls
const patterns = ["data/hiro.patt", "data/kanji.patt", "data/letterA.patt", "data/letterB.patt", "data/letterC.patt", "data/letterD.patt", "data/letterF.patt", "data/letterG.patt"];
let markerRoots = [];
let markersVisible = [];
for (let i = 0; i < patterns.length; i++) {
  const markerRoot = new THREE.Group();
  scene.add(markerRoot);
  markerRoots.push(markerRoot);
  const markerControl = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
    type: 'pattern', patternUrl: patterns[i],
  });
  markerControl.i = i;
  markerControl.addEventListener("markerFound", (e)=>{
    markersVisible[e.target.i] = true;
  });
  /*markerControl.addEventListener("markerLost", (e)=>{
    markersVisible[e.target.i] = false;
  });*/
  markersVisible.push(false);
}

//this allows for phong to occur
{
  const color = 0xFFFFFF;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
}

// this adds fog
let useFog = false;
if (useFog) {
    const near = 0;
    const far = 2;
    const color = 'lightblue';
    scene.fog = new THREE.Fog(color, near, far);
    scene.background = new THREE.Color(color);
}


cube.position.y -= 1;
cube.position.z = -10;
cube2.position.x = -5;
cube2.position.y -= 1;
cube2.position.z = -10;

sphere.position.z = -10;
sphere.position.y = 5;

let sceneRoot = new THREE.Group();
sceneRoot.add(cube);
sceneRoot.add(cube2);
sceneRoot.add(sphere);
sceneRoot.position.z = 0;
sceneRoot.position.x = -0.3;
sceneRoot.position.y = 0.5;

let arGroup = new THREE.Group();
arGroup.add(sceneRoot);
scene.add(arGroup);

// Request animation frame loop function
var lastRender = 0;
let frameNum = 0;
function animate(timestamp) {
  frameNum += 1;
  if ( arToolkitSource.ready !== false ) {
    arToolkitContext.update( arToolkitSource.domElement );
    arToolkitSource.domElement.display = "none";
  }

  var delta = Math.min(timestamp - lastRender, 500);
  lastRender = timestamp;

  // Apply rotation to cube mesh
  cube.rotation.y += delta * 0.0006;

  if (keyboardDebugging) {
    if (movelr != 0 || moveud != 0 || movefb != 0) {
        arGroup.position.x -= movelr*walkspeed*delta/1000;
        arGroup.position.y -= moveud*walkspeed*delta/1000;
        arGroup.position.z += movefb*walkspeed*delta/1000;
        console.log(arGroup.position);
    }
  }
  else {
    let x = 0;
    let y = 0;
    let z = 0;
    let count = 0;
    // Average the positions of the visible markers
    for (let i = 0; i < markerRoots.length; i++) {
      if (markersVisible[i]) {
        x += markerRoots[i].position.x;
        y += markerRoots[i].position.y;
        z += markerRoots[i].position.z;
        count += 1;
      }
      markersVisible[i] = false;
    }
    if (count > 0) {
      console.log("Averaging " + count + " markers");
      arGroup.position.x = x/count;
      arGroup.position.y = y/count;
      arGroup.position.z = z/count;
    }
    else {
      console.log("No markers found");
    }


    //arGroup.rotation.x = markerRoot1.rotation.x;
    //arGroup.rotation.y = markerRoot1.rotation.y;
    //arGroup.rotation.z = markerRoot1.rotation.z;

    arGroup.rotation.x = 0;
    arGroup.rotation.y = 0;
    arGroup.rotation.z = 0;
  }




  // Update VR headset position and apply to camera.
  //controls.update();

  // Render the scene.
  effect.render(scene, camera);

  // Keep looping.
  vrDisplay.requestAnimationFrame(animate);
  
  //console.log(markerRoot1.position);
}

function onResize() {
  effect.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

function onVRDisplayPresentChange() {
  console.log('onVRDisplayPresentChange');
  onResize();
}

// Resize the WebGL canvas when we resize and also when we change modes.
window.addEventListener('resize', onResize);
window.addEventListener('vrdisplaypresentchange', onVRDisplayPresentChange);

// Button click handlers.
document.querySelector('button#fullscreen').addEventListener('click', function() {
  enterFullscreen(canvas);
});
document.querySelector('button#vr').addEventListener('click', function() {
  vrDisplay.requestPresent([{source: canvas }]);
});
document.querySelector('button#reset').addEventListener('click', function() {
  vrDisplay.resetPose();
});

function enterFullscreen (el) {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
}