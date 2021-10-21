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

        this.calibrated = false;
        this.calArray = [false,false,false,false];

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
        const numMarkersPS = 2;
        this.numMarkersPS = numMarkersPS;


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
        //this.calibratePlacement();
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

        const patternsR = ["data/letterA.patt", "data/letterC.patt", "data/letterF.patt"];
        const patternsL = ["data/kanji.patt","data/letterB.patt", "data/letterD.patt"];
        let markerRootsL = [];
        let markerRootsR = [];
        let markersVisibleL = [];
        let markersVisibleR = [];
        this.markerRootsL = markerRootsL;
        this.markerRootsR = markerRootsR;
        this.markersVisibleL = markersVisibleL;
        this.markersVisibleR = markersVisibleR;

        for (let i = 0; i < patternsL.length; i++) {
            const markerRoot = new THREE.Group();
            this.scene.add(markerRoot);
            markerRootsL.push(markerRoot);
            const markerControl = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
                type: 'pattern', patternUrl: patternsL[i]
            });
            markerControl.i = i;
            markersVisibleL.push(false);
            markerControl.addEventListener("markerFound", (e)=>{
                this.markersVisibleL[e.target.i] = true;
                console.log("Left marker "+i+" found");
                if(markerControl.i < 2){
                    this.calArray[i] = true;
                }
            });
            markerControl.addEventListener("markerLost", (e)=>{
                this.markersVisibleL[e.target.i] = false;
                console.log("Left marker "+i+" lost");
            });
            //markersVisible.push(false);
        }

        for (let i = 0; i < patternsR.length; i++) {
            const markerRoot = new THREE.Group();
            this.scene.add(markerRoot);
            markerRootsR.push(markerRoot);
            const markerControl = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
                type: 'pattern', patternUrl: patternsR[i]
            });
            markerControl.i = i;
            markersVisibleR.push(false);
            markerControl.addEventListener("markerFound", (e)=>{
                this.markersVisibleR[e.target.i] = true;
                //markersVisibleR[i] = true;
                console.log("Right marker "+i+" found");
                if(markerControl.i < 2){
                    this.calArray[e.target.i+2] = true;
                }
            });
            markerControl.addEventListener("markerLost", (e)=>{
                this.markersVisibleR[e.target.i] = false;
                //markersVisibleR[i] = false;
                console.log("Right marker "+i+" lost");
            });
            //markersVisible.push(false);
        }

        this.arGroup = new THREE.Group();
        this.arGroup.add(this.sceneRoot);
        this.scene.add(this.arGroup);
    }   
        

    calibratePlacement(){
        let foundMarkers = false;

        while(!foundMarkers){
            if(this.markersVisibleL[0] && this.markersVisibleL[1] &&
                this.markersVisibleR[0] && this.markersVisibleR[1]){

                    console.log(this.markerRootsL[0].position)

                    let mRL = this.markerRootsL;
                    let mRR = this.markerRootsR;
                    
                    let lV = mRL[1].position.sub(mRL[0].position);
                    let rV = mRR[1].position.sub(mRR[0].position);
                    let sLV = (lV.multiplyScalar(this.numMarkersPS-1)).divideScalar(2);
                    let sRV = (rV.multiplyScalar(this.numMarkersPS-1)).divideScalar(2);
                    sRV.x = Math.abs(sRV.x);
                    let sV = (sLV.add(sRV)).divideScalar(2);
                    console.log(sV);
                    this.sceneOriginVector = sV;
                    this.arGroup.position.x = mRL[0].position.x + sV.x;
                    this.arGroup.position.y = mRL[0].position.y + sV.y;
                    this.arGroup.position.z = mRL[0].position.z + sV.z;
                    foundMarkers = true;
            }
        }
        //this.arGroup.position = (this.markerRootsL[0].position).add(this.sceneOriginVector);
        console.log(this.arGroup.position);
        console.log("did calibrate");
        this.calibrated = true;
    }

    isCalibratable(){
        let count = 0;
        for(let i = 0; i < 4; i++){
            if(this.calArray[i]){
                count++;
            }
        }
        console.log(count);
        if(count == 4){
            this.calibratePlacement();
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

        if (this.keyboardDebugging) {
            const K = this.keyboard;
            if (K.movelr != 0 || K.moveud != 0 || K.movefb != 0) {
                this.markerRoot.position.x -= K.movelr*K.walkspeed*delta/1000;
                this.markerRoot.position.y -= K.moveud*K.walkspeed*delta/1000;
                this.markerRoot.position.z += K.movefb*K.walkspeed*delta/1000;
            }
        }else if(!this.calibrated){
            this.isCalibratable();
        }else{
            /*
            let markerRootsL = this.markerRootsL;
            let markerRootsR = this.markerRootsR;
            let markersVisibleL = this.markersVisibleL;
            let markersVisibleR = this.markersVisibleR;
            let x = 0;
            let y = 0;
            let z = 0;
            let count = 0;
            for(let i = 0; i < markerRootsL.length; i++){
                if(markersVisibleL[i]){
                    x += markerRootsL[i].position.x;
                    y += markerRootsL[i].position.y;
                    z += markerRootsL[i].position.z;
                    count += 1;
                }
                if(markersVisibleR[i]){
                    x += markerRootsR[i].position.x;
                    y += markerRootsR[i].position.y;
                    z += markerRootsR[i].position.z;
                    count += 1;
                }
                //markersVisible[i]=false;
            }
            
            if(count <= 0){
                this.arGroup.visible = false;
            }else{
                this.arGroup.visible = true;
                this.arGroup.position.x = x/count;
                this.arGroup.position.y = y/count;
                this.arGroup.position.z = z/count;
            }
            */
            //count = 0;
            
            //console.log(this.arGroup.position);
        }
        //console.log(this.markerRootsR[2].position.x);
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.repaint.bind(this));

        /*
        x -1.68 1.8
        y -1.37 1.45
        z 
        */
    }

}

//TODO: incorporate lost marker feature

/*
        const markerRoot = new THREE.Group();
        this.markerRoot = markerRoot;
        this.scene.add(markerRoot);

        let markerParameters = {
            type: "pattern",
            patternUrl: "data/letterA.patt",
            // turn on/off camera smoothing
            smooth: true,
            // number of matrices to smooth tracking over, more = smoother but slower follow
            smoothCount: 5,
            // distance tolerance for smoothing, if smoothThreshold # of matrices are under tolerance, tracking will stay still
            smoothTolerance: 0.01,
            // threshold for smoothing, will keep still unless enough matrices are over tolerance
            smoothThreshold: 2
        };

        const markerControl = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, markerParameters);
        markerControl.addEventListener("markerFound", (e)=>{
            // TODO: We can do stuff once a marker is found
            console.log("Found");
        });
        markerControl.addEventListener("markerLost", (e)=>{
            // TODO: We can do stuff once a marker is lost
            console.log("lost");
        });
        */