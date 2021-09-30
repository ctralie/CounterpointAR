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
        renderer.setSize( 640, 480 );
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0px'
        renderer.domElement.style.left = '0px'
        document.body.appendChild( renderer.domElement );

        // Finally, setup the AR tracker
        console.log("prior to tracker");
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
        arToolkitContext.init();//(function onCompleted(){
        //    that.camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
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
                console.log("marker found");
            });
            markerControl.addEventListener("markerLost", (e)=>{
                markersVisible[e.target.i] = false;
                console.log("marker lost");
            });
            markersVisible.push(false);
            lastMarkerPos.push([0, 0, 0]);
        }
        this.arGroup = new THREE.Group();
        this.arGroup.add(this.sceneRoot);
        this.scene.add(this.arGroup);
    }

    /**
     * Perform an animation step, which consists of tracking the AR targets and updating
     * the global AR positions, as well as animating the scene forward in time
     */
    /*
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

        if (this.keyboardDebugging) {
            const K = this.keyboard;
            if (K.movelr != 0 || K.moveud != 0 || K.movefb != 0) {
                this.markerRoot.position.x -= K.movelr*K.walkspeed*delta/1000;
                this.markerRoot.position.y -= K.moveud*K.walkspeed*delta/1000;
                this.markerRoot.position.z += K.movefb*K.walkspeed*delta/1000;
            }
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.repaint.bind(this));
    }
    */
    repaint() {
        if ( this.arToolkitSource.ready !== false ) {
            this.arToolkitContext.update( this.arToolkitSource.domElement );
            this.arToolkitSource.domElement.display = "none";
        }
        let deltaTime = this.clock.getDelta();
        if (this.totalTime < 6 && (this.totalTime+deltaTime)%1 < this.totalTime%1) {
            // A hack to trigger resizing every second for the first 5 seconds
            // TODO: Try something more elegant?
            this.onResize();
        }
        this.totalTime += deltaTime;
        this.sceneObj.animate(deltaTime);

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
        this.renderer.render(this.scene, this.camera);

        // Keep looping.
        requestAnimationFrame(this.repaint.bind(this));
    }

}