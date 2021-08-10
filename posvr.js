function getVRConfig() {
    let config = {};
    let q = window.location.search.substring(1);
    if (q === '') {
        return config;
    }
    let params = q.split('&');
    let param, name, value;
    for (let i = 0; i < params.length; i++) {
        param = params[i].split('=');
        name = param[0];
        value = param[1];
        // All config values are either boolean or float
        config[name] = value === 'true' ? true :
                        value === 'false' ? false :
                        parseFloat(value);
    }
    return config;
}

// Mock VRFrameData for VRControls
function VRFrameData () {
    this.leftViewMatrix = new Float32Array(16);
    this.rightViewMatrix = new Float32Array(16);
    this.leftProjectionMatrix = new Float32Array(16);
    this.rightProjectionMatrix = new Float32Array(16);
    this.pose = null;
};


class PositionalVR {
    /**
     * 
     * @param {object} sceneObj An object that contains the fields scene, camera, and sceneRoot,
     *                     as well as a method animate(dt)
     * @param {*boolean} antialias Whether or not to do antialiasing (false by default, since it causes
     *                      a performance hit)
     * @param {boolean} debug     Whether to print information about how many markers were seen
     */
    constructor(sceneObj, antialias, debug) {
        let that = this;
        this.sceneObj = sceneObj;
        this.scene = sceneObj.scene;
        this.camera = sceneObj.camera;
        this.sceneRoot = sceneObj.sceneRoot;

        this.keyboardDebugging = false;
        this.keyboard = new KeyboardHandler();

        if (antialias === undefined) {
            antialias = false;
        }
        if (debug === undefined) {
            debug = false;
        }
        this.debug = debug;
        // Get config from URL
        let config = getVRConfig();
        console.log('creating CardboardVRDisplay with options', config);
        this.vrDisplay = new CardboardVRDisplay(config);

        navigator.getVRDisplays = function () {
            return new Promise(function (resolve) {
                resolve([that.vrDisplay]);
            });
        };
        let canvas = document.querySelector('canvas');
        this.canvas = canvas;
        // Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
        // Only enable it if you actually need to.
        this.renderer = new THREE.WebGLRenderer({antialias: antialias, canvas: this.canvas});
        this.renderer.setPixelRatio(Math.floor(window.devicePixelRatio));

        // Apply VR headset positional data to camera.
        //this.controls = new THREE.VRControls(this.camera);

        // Apply VR stereo rendering to renderer.
        this.effect = new THREE.VREffect(this.renderer);
        this.effect.setSize(window.innerWidth, window.innerHeight);

        // Kick off the render loop.
        this.lastRender = 0;
        this.vrDisplay.requestAnimationFrame(this.animate.bind(this));
        

        // Resize the WebGL canvas when we resize and also when we change modes.
        window.addEventListener('resize', this.onResize.bind(this));
        window.addEventListener('vrdisplaypresentchange',  this.onResize.bind(this));

        // Button click handlers.
        document.querySelector('button#fullscreen').addEventListener('click', function() {
            that.enterFullscreen(that.canvas);
        });
        document.querySelector('button#vr').addEventListener('click', function() {
            that.vrDisplay.requestPresent([{source: that.canvas }]);
        });
        document.querySelector('button#reset').addEventListener('click', function() {
            that.vrDisplay.resetPose();
        });

        // Finally, setup tracker
        this.setupTracker();
    }


    onResize() {
        if (!(this.renderer === undefined)) {
            this.arToolkitSource.onResize();
            this.arToolkitSource.copySizeTo(this.renderer.domElement);
            if (this.arToolkitContext.arController !== null) {
                this.arToolkitSource.copySizeTo(this.arToolkitContext.arController.canvas);
            }
        }
        if (!(this.effect === undefined)) {
            this.effect.setSize(window.innerWidth, window.innerHeight);
        }
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
    }

    enterFullscreen (el) {
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

    /**
     * Setup the AR system, which is used to track position
     */
    setupTracker() {
        // create this.arToolkitSource
        let that = this;
        this.arToolkitSource = new THREEx.ArToolkitSource({
            sourceType : 'webcam',
        });
        this.arToolkitSource.init(function onReady(){
            that.onResize();
        });
        // handle resize event
        window.addEventListener('resize', function(){
            that.onResize();
        });

        // create arToolkitContext
        let arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: 'data/camera_para.dat',
            detectionMode: 'mono'
        });
        this.arToolkitContext = arToolkitContext;

        // copy projection matrix to camera when initialization complete
        arToolkitContext.init();// function onCompleted(){
        //    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
        //});

        // Adding the AR markerControls
        const patterns = ["data/hiro.patt", "data/kanji.patt", "data/letterA.patt", "data/letterB.patt", "data/letterC.patt", "data/letterD.patt", "data/letterF.patt", "data/letterG.patt"];
        let markerRoots = [];
        let markersVisible = [];
        let lastMarkerPos = []; // For keeping track of the last marker positions
        this.markerRoots = markerRoots;
        this.markersVisible = markersVisible;
        this.lastMarkerPos = lastMarkerPos;
        for (let i = 0; i < patterns.length; i++) {
            const markerRoot = new THREE.Group();
            this.scene.add(markerRoot);
            markerRoots.push(markerRoot);
            const markerControl = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
                type: 'pattern', patternUrl: patterns[i],
            });
            markerControl.i = i;
            markerControl.addEventListener("markerFound", (e)=>{
                that.markersVisible[e.target.i] = true;
            });
            /*markerControl.addEventListener("markerLost", (e)=>{
                markersVisible[e.target.i] = false;
            });*/
            markersVisible.push(false);
            lastMarkerPos.push([0, 0, 0]);
        }
        this.arGroup = new THREE.Group();
        this.arGroup.add(this.sceneRoot);
        this.scene.add(this.arGroup);
    }

    /**
     * Perform an animation step, which consists of tracking the AR target and updating
     * the global AR position, as well as animating the scene forward in time
     * @param {float} timestamp The current time
     */
    animate(timestamp) {
        if ( this.arToolkitSource.ready !== false ) {
            this.arToolkitContext.update( this.arToolkitSource.domElement );
            this.arToolkitSource.domElement.display = "none";
        }
        let delta = Math.min(timestamp - this.lastRender, 500);
        this.lastRender = timestamp;


        this.sceneObj.animate(delta);

        const arGroup = this.arGroup;
        if (this.keyboardDebugging) {
            const K = this.keyboard;
            if (K.movelr != 0 || K.moveud != 0 || K.movefb != 0) {
                arGroup.position.x -= K.movelr*K.walkspeed*delta/1000;
                arGroup.position.y -= K.moveud*K.walkspeed*delta/1000;
                arGroup.position.z += K.movefb*K.walkspeed*delta/1000;
            }
        }
        else {
            // Use markers
            const markerRoots = this.markerRoots;
            const markersVisible = this.markersVisible;
            const lastMarkerPos = this.lastMarkerPos;
            let dx = 0;
            let dy = 0;
            let dz = 0;
            let count = 0;
            // Step 1: Average the changes in position of the visible markers
            for (let i = 0; i < markerRoots.length; i++) {
                if (markersVisible[i]) {
                    dx += markerRoots[i].position.x - lastMarkerPos[i][0];
                    dy += markerRoots[i].position.y - lastMarkerPos[i][1];
                    dz += markerRoots[i].position.z - lastMarkerPos[i][2];
                    count += 1;
                    lastMarkerPos[i][0] = markerRoots[i].position.x;
                    lastMarkerPos[i][1] = markerRoots[i].position.y;
                    lastMarkerPos[i][2] = markerRoots[i].position.z;
                }
            }
            if (count > 0) {
                // Step 2: Apply this change to the unseen markers and add up all
                // of the positions
                let x = 0;
                let y = 0;
                let z = 0;
                for (let i = 0; i < markerRoots.length; i++) {
                    if (!markersVisible[i]) {
                        lastMarkerPos[i][0] += dx/count;
                        lastMarkerPos[i][1] += dy/count;
                        lastMarkerPos[i][2] += dz/count;
                    }
                    x += lastMarkerPos[i][0];
                    y += lastMarkerPos[i][1];
                    z += lastMarkerPos[i][2];
                    markersVisible[i] = false;
                }
                // Step 3: Set the position to be the average
                arGroup.position.x = x/markerRoots.length;
                arGroup.position.y = y/markerRoots.length;
                arGroup.position.z = z/markerRoots.length;
                if (this.debug) {
                    console.log(count + " markers seen");
                    console.log("x = " + arGroup.position.x + ", y = " + arGroup.position.y + ", z = " + arGroup.position.z);
                }
                //arGroup.rotation.x = markerRoot1.rotation.x;
                //arGroup.rotation.y = markerRoot1.rotation.y;
                //arGroup.rotation.z = markerRoot1.rotation.z;
    
                arGroup.rotation.x = 0;
                arGroup.rotation.y = 0;
                arGroup.rotation.z = 0;
            }
            else {
                if (this.debug) {
                    console.log("No markers found");
                }
            }
        }
        // Update VR headset position and apply to camera.
        //controls.update();

        // Render the scene.
        this.effect.render(this.scene, this.camera);

        // Keep looping.
        this.vrDisplay.requestAnimationFrame(this.animate.bind(this));
    }

}