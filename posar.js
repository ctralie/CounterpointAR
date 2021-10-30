/*const PATTERNS_AR = [
    {"url":"data/letterA.patt", "pos":[-1, 1]},
    {"url":"data/letterB.patt", "pos":[-1, 0]},
    {"url":"data/letterC.patt", "pos":[-1, -1]},
    {"url":"data/letterD.patt", "pos":[1, 1]},
    {"url":"data/kanji.patt", "pos":[1, 0]},
    {"url":"data/letterF.patt", "pos":[1, -1]}
];*/


const PATTERNS_AR = [
    {"url":"data/letterA.patt", "pos":[-1, -1]},
    {"url":"data/letterD.patt", "pos":[-1, 0]},
    {"url":"data/letterB.patt", "pos":[1, -1]},
    {"url":"data/letterF.patt", "pos":[1, 0]}
];

class PositionalAR {
    /**
     * 
     * @param {object} sceneObj An object that contains the fields scene, camera, and sceneRoot,
     *                     as well as a method animate(dt)
     * @param {boolean} antialias Whether or not to do antialiasing (true by default, but can be turned off
     *                            for performance)
     * @param {boolean} debug     Whether to print information about how many markers were seen
     */
    constructor(sceneObj, antialias, debug) {
        const that = this;
        this.sceneObj = sceneObj;
        this.scene = sceneObj.scene;
        this.camera = sceneObj.camera;
        this.sceneRoot = sceneObj.sceneRoot;

        this.keyboardDebugging = false;
        this.keyboard = new KeyboardHandler();
        if (antialias === undefined) {
            antialias = true;
        }
        if (debug === undefined) {
            debug = false;
        }
        this.debug = debug;
        this.clock = new THREE.Clock();
        this.totalTime = 0;

        // Setup three.js WebGL renderer
        const renderer = new THREE.WebGLRenderer({antialias: antialias, alpha: true});
        this.renderer = renderer;
        renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        renderer.setSize(640, 480);
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0px'
        renderer.domElement.style.left = '0px'
        document.body.appendChild( renderer.domElement );

        // Finally, setup the AR tracker
        this.setupTracker();
        this.repaint();
    }


    onResize() {
        this.arToolkitSource.onResizeElement();
        this.arToolkitSource.copyElementSizeTo(this.renderer.domElement);
        if (this.arToolkitContext.arController !== null) {
            this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas);
        }
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
        const that = this;
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
        const arToolkitContext = new THREEx.ArToolkitContext({
            cameraParametersUrl: 'data/camera_para.dat',
            detectionMode: 'mono'
        });
        this.arToolkitContext = arToolkitContext;

        // copy projection matrix to camera when initialization complete
        arToolkitContext.init(function onCompleted(){
            that.camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
        });
        let markerRoots = [];
        this.markerRoots = markerRoots;
        // Variables for running averages of intervals
        this.horizNumer = 0;
        this.horizCount = 0;
        this.vertNumer = 0;
        this.vertCount = 0;
        for (let i = 0; i < PATTERNS_AR.length; i++) {
            const markerRoot = new THREE.Group();
            markerRoot.markerPos = PATTERNS_AR[i].pos;
            markerRoot.visible = false;
            this.scene.add(markerRoot);
            markerRoots.push(markerRoot);
            const markerControl = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
                type: 'pattern', patternUrl: PATTERNS_AR[i].url
            });
            markerControl.i = i;
            markerControl.addEventListener("markerFound", (e)=>{
                that.markerRoots[e.target.i].visible = true;
                console.log("Marker "+i+" found");
            });
            markerControl.addEventListener("markerLost", (e)=>{
                this.markerRoots[e.target.i].visible = false;
                //console.log("Marker "+i+" lost");
            });
        }
        this.arGroup = new THREE.Group();
        this.arGroup.add(this.sceneRoot);
        this.scene.add(this.arGroup);
    }   
        
    /**
     * Update a running average of the horizontal interval and vertical
     * interval between adjacent markers based on which markers are visible
     */
    updateCalibration(){
        // Check all pairs of markers against each other
        for (let i = 0; i < this.markerRoots.length; i++) {
            const marker1 = this.markerRoots[i];
            if (marker1.visible) {
                const pos1 = marker1.markerPos;
                for (let j = i+1; j < this.markerRoots.length; j++) {
                    const marker2 = this.markerRoots[j];
                    if (marker2.visible) {
                        const pos2 = marker2.markerPos;
                        let dx = Math.abs(pos1[0] - pos2[0]);
                        let dy = Math.abs(pos1[1] - pos2[1]);
                        let d = marker1.position.distanceTo(marker2.position);
                        if (d < 100) { // TODO: Figure out why the distance sometimes spikes
                            // Check to see if it's possible to update horizontal interval
                            if (dx > 0 && dy == 0) {
                                this.horizNumer += d/dx;
                                this.horizCount++;
                            }
                            else if (dx == 0 && dy > 0) {
                                this.vertNumer += d/dy;
                                this.vertCount++;
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Come up with the position of the root of the scene based on
     * which markers are visible 
     */
    placeSceneRoot() {
        // Make sure we have enough calibration info to place things
        if (this.horizCount > 0 && this.vertCount > 0) {
            let h = this.horizNumer/this.horizCount; // Horizontal interval
            let v = this.vertNumer/this.vertCount; // Vertical interval
            console.log("h = " + h + ", v = " + v);
            let numVisible = 0;
            let avgPos = new THREE.Vector3();
            let avgQuat = null;
            for (let i = 0; i < this.markerRoots.length; i++) {
                const marker = this.markerRoots[i];
                if (marker.visible) {
                    numVisible++;
                    // Devise vector from this marker to the center in 
                    // world coordinates.  This is the negative of the 
                    // relative position of the marker since it points towards
                    // the center
                    let pos = new THREE.Vector3(-marker.markerPos[0]*h, 0, -marker.markerPos[1]*v);
                    pos = marker.localToWorld(pos);
                    avgPos.add(pos);

                    // For now just make the orientation be the orientation of the last
                    // marker seen
                    avgQuat = marker.quaternion;
                    marker.visible = false; // Set to be not visible again so it will be properly updated on the next frame
                }
            }
            if (numVisible > 0) {
                avgPos.divideScalar(numVisible);
                this.arGroup.position.x = avgPos.x;
                this.arGroup.position.y = avgPos.y;
                this.arGroup.position.z = avgPos.z;
                this.arGroup.setRotationFromQuaternion(avgQuat);
            }
        }
    }
        

    /**
     * Perform an animation step, which consists of tracking the AR targets and updating
     * the global AR positions, as well as animating the scene forward in time
     */
    repaint() {
        if ( this.arToolkitSource.initialized !== false ) {
            this.arToolkitContext.update( this.arToolkitSource.domElement );
        }
        let deltaTime = this.clock.getDelta();
        if (this.totalTime < 6 && (this.totalTime+deltaTime)%1 < this.totalTime%1) {
            // A hack to trigger resizing every second for the first 5 seconds
            // TODO: Try something more elegant?
            this.onResize();
        }
        this.totalTime += deltaTime;
        this.sceneObj.animate(deltaTime);
        this.updateCalibration();
        this.placeSceneRoot();

        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.repaint.bind(this));
    }

}