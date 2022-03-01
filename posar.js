/*
Markers were made using this:
https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
The image size set to 2500px, pattern ratio set to .9
*/

const PATTERNS_AR = [
    {"url":"data/newmarkers/pattern-A.patt", "pos":[1, 0]},
    {"url":"data/newmarkers/pattern-B.patt", "pos":[1, 1]},
    {"url":"data/newmarkers/pattern-C.patt", "pos":[1, 2]},
    {"url":"data/newmarkers/pattern-D.patt", "pos":[1, 3]},
    {"url":"data/newmarkers/pattern-E.patt", "pos":[1, 4]},
    {"url":"data/newmarkers/pattern-F.patt", "pos":[1, 5]},
    {"url":"data/newmarkers/pattern-M.patt", "pos":[1, 6]},
    {"url":"data/newmarkers/pattern-N.patt", "pos":[1, 7]},
    {"url":"data/newmarkers/pattern-O.patt", "pos":[1, 8]},
    {"url":"data/newmarkers/pattern-P.patt", "pos":[1, 9]},
    {"url":"data/newmarkers/pattern-Q.patt", "pos":[1, 10]},
    {"url":"data/newmarkers/pattern-R.patt", "pos":[1, 11]},

    {"url":"data/newmarkers/pattern-G.patt", "pos":[-1, 0]},
    {"url":"data/newmarkers/pattern-H.patt", "pos":[-1, 1]},
    {"url":"data/newmarkers/pattern-I.patt", "pos":[-1, 2]},
    {"url":"data/newmarkers/pattern-J.patt", "pos":[-1, 3]},
    {"url":"data/newmarkers/pattern-K.patt", "pos":[-1, 4]},
    {"url":"data/newmarkers/pattern-L.patt", "pos":[-1, 5]},
    {"url":"data/newmarkers/pattern-S.patt", "pos":[-1, 6]},
    {"url":"data/newmarkers/pattern-T.patt", "pos":[-1, 7]},
    {"url":"data/newmarkers/pattern-U.patt", "pos":[-1, 8]},
    {"url":"data/newmarkers/pattern-V.patt", "pos":[-1, 9]},
    {"url":"data/newmarkers/pattern-W.patt", "pos":[-1, 10]},
    {"url":"data/newmarkers/pattern-X.patt", "pos":[-1, 11]}
];

const TREBXPOS = {"B#3":{"pos":3.5},"Cf4":{"pos":3},"C4":{"pos":3},"C#4":{"pos":3},
"Df4":{"pos":2.5},"D4":{"pos":2.5},"D#4":{"pos":2.5},"Ef4":{"pos":2},"E4":{"pos":2},
"E#4":{"pos":2},"Ff4":{"pos":1.5},"F4":{"pos":1.5},"F#4":{"pos":1.5},"Gf4":{"pos":1},
"G4":{"pos":1},"G#4":{"pos":1},"Af4":{"pos":0.5},"A4":{"pos":0.5},"A#4":{"pos":0.5},
"Bf4":{"pos":0},"B4":{"pos":0},"B#4":{"pos":0},"Cf5":{"pos":-0.5},"C5":{"pos":-0.5},
"C#5":{"pos":-0.5},"Df5":{"pos":-1},"D5":{"pos":-1},"D#5":{"pos":-1},"Ef5":{"pos":-1.5},
"E5":{"pos":-1.5},"E#5":{"pos":-1.5},"Ff5":{"pos":-2},"F5":{"pos":-2},"F#5":{"pos":-2},
"Gf5":{"pos":-2.5},"G5":{"pos":-2.5},"G#5":{"pos":-2.5},"Af5":{"pos":-3},"A5":{"pos":-3},
"A#5":{"pos":-3}};

//starts at D3
const ALTOXPOS = [3.5,3.5,3,3,2.5,2,2,1.5,1.5,
    1,1,.5,0,0,-.5,-.5,1,-1.5,-1.5,-2,-2,-2.5];

//starts at E2
const BASSXPOS = [3,3,2.5,2.5,2,1.5,1.5,1,1,.5,
    .5,0,-.5,-.5,-1,-1,-1.5,-2,-2,-2.5,-2.5,-3];

class PositionalAR {
    /**
     * 
     * @param {object} sceneObj An object that contains the fields scene, camera, and sceneRoot,
     *                     as well as a method animate(dt)
     * @param {boolean} antialias Whether or not to do antialiasing (true by default, but can be turned off
     *                            for performance)
     * @param {int} medWin   Length of window for median denoising of positions
     * @param {boolean} debug     Whether to print information about how many markers were seen
     */
    constructor(sceneObj, digAudio, useCantusFirmus, useCounterpoint,antialias, medWin, debug) {
        const that = this;
        this.sceneObj = sceneObj;
        this.scene = sceneObj.scene;
        this.camera = sceneObj.camera;
        this.sceneRoot = sceneObj.sceneRoot;
        this.digAud = digAudio;

        this.keyboardDebugging = false;
        this.keyboard = new KeyboardHandler();
        if (antialias === undefined) {
            antialias = true;
        }
        if (medWin === undefined) {
            medWin = 3;
        }
        if (debug === undefined) {
            debug = false;
        }
        this.medWin = medWin;
        this.debug = debug;
        this.clock = new THREE.Clock();
        this.totalTime = 0;
        this.gotPlacement = false;


        this.linesToUse = [useCantusFirmus, useCounterpoint];
        this.arrivedAtNote = [];
        this.didPlayNoteAudio = [];
        
        this.noteGroupPlacement = -2;
        this.spaceAboveStaff = .1;

        this.trackedPositions = [];
        
        
        // Setup three.js WebGL renderer
        const renderer = new THREE.WebGLRenderer({antialias: antialias, alpha: true});
        this.renderer = renderer;
        renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        renderer.setSize(640, 480);
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0px'
        renderer.domElement.style.left = '0px'
        document.body.appendChild( renderer.domElement );

        this.setupTracker();
        let sA = new SampledAudio();
        this.sampAud = sA;
        
        this.sampAud.startRecording();
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
            detectionMode: 'mono',
            patternRatio: 0.9
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
            let markerRoot = new THREE.Group();
            markerRoot.visible = false;
            markerRoot.markerPos = PATTERNS_AR[i].pos;
            markerRoot.posHistory = [];
            that.scene.add(markerRoot);
            markerRoots.push(markerRoot);
            let markerControl = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
                size: 1, type: 'pattern', patternUrl: PATTERNS_AR[i].url, smooth: true
                //minConfidence: 0.3,
                //smooth: true, smoothCount: 2, smoothTolerance: 0.01, smoothThreshold: 2
            });
            markerControl.i = i;
            markerControl.addEventListener("markerFound", (e)=>{
                that.markerRoots[e.target.i].visible = true;
                //console.log("Marker "+i+" found");
            });
            markerControl.addEventListener("markerLost", (e)=>{
                that.markerRoots[e.target.i].visible = false;
                console.log("Marker "+i+" lost");
            });
        }
        
        this.arGroup = new THREE.Group();
        this.arGroup.add(this.sceneRoot);
        this.setupGhostNote();
        this.setupFirstSpeciesNotes();
        this.scene.add(this.arGroup);
    }

    clefXChoice(clefChoice){
        let posarr = [];
        if(clefChoice === "Treble"){
            posarr = TREBXPOS;
        }else if(clefChoice === "Alto"){
            posarr = ALTOXPOS;
        }else{
            posarr = BASSXPOS;
        }
        return posarr;
    }

    /**
     * Creates current position ghost note object
     * Added to ARGROUP as child
     */
    setupGhostNote(){
        this.noteG = new THREE.TorusGeometry(.35, .08, 10, 24);
        this.noteG.scale(1,1.55,1);
        this.noteG.rotateX(1.57);
        let gNM = new THREE.MeshStandardMaterial({color: 0xB41697});
        this.note = new THREE.Group();
        this.note.add(new THREE.Mesh(this.noteG,gNM));
        this.arGroup.add(this.note);
        this.AGGNI = this.arGroup.children.length - 1;
        this.arGroup.children[this.AGGNI].position.y = this.spaceAboveStaff;
    }

    /**
     * Creates a collection of note objects (for cantus firmus line and/or counterpoint line)
     * Note Groups are added to ARGROUP as children
     * 2 sets of notes are created, one set on staff, other set out of view
     * Sets index number of each group as class member data
     */
    setupFirstSpeciesNotes(){
        this.musicNoteShape = new THREE.TorusGeometry(.35, .08, 10, 24);
        this.musicNoteShape.scale(1,1.55,1);
        this.musicNoteShape.rotateX(1.57);
        let noteMaterial = new THREE.MeshStandardMaterial({color: 0x000000});
        let newColorMat = new THREE.MeshStandardMaterial({color: 0xF5BB00});
        this.xPosArr = this.clefXChoice(this.digAud.clef);
        this.songLength = this.digAud.cfLength;

        this.CFGroup = new THREE.Group();
        this.CPGroup = new THREE.Group();
        this.CFGroupNew = new THREE.Group();
        this.CPGroup = new THREE.Group();
        let linesNotes = [this.digAud.cantusFirmusNotes,this.digAud.counterpointNotes];

        for(let i = 0; i < this.linesToUse.length; i++){
            if(this.linesToUse[i]){
                let songNotes = linesNotes[i];
                let noteSpacing = 1.75;
                let notePositionZ = 1;          
                for(let j = 0; j < this.songLength; j++){
                    let newNote = new THREE.Mesh(this.musicNoteShape, noteMaterial);
                    let finNote = new THREE.Mesh(this.musicNoteShape, newColorMat);
                    newNote.position.x = this.xPosArr[songNotes[j]].pos;
                    finNote.position.x = this.xPosArr[songNotes[j]].pos;
                    newNote.position.y = this.spaceAboveStaff;
                    finNote.position.y = 100;
                    newNote.position.z = notePositionZ - noteSpacing;
                    finNote.position.z = notePositionZ - noteSpacing;
                    notePositionZ = newNote.position.z;
                    if(i==0){
                        this.CFGroup.add(newNote);
                        this.CFGroupNew.add(finNote);
                    }else if(i==1){
                        this.CPGroup.add(newNote);
                        this.CPGroup.add(finNote);
                    }
                }
                if(i==0){
                    this.arGroup.add(this.CFGroup);
                    this.AGCFI = this.arGroup.children.length - 1;
                    this.arGroup.add(this.CFGroupNew);
                    this.AGCFNI =this.arGroup.children.length - 1;
                }else if(i==1){
                    this.arGroup.add(this.CPGroup);
                    this.AGCPI = this.arGroup.children.length - 1;
                    this.arGroup.add(this.CPGroupNew);
                    this.AGCPNI = this.arGroup.children.length - 1;
                }
            }
        }
        for(let i = 0; i < this.songLength; i++){
            this.didPlayNoteAudio.push(false);
            this.arrivedAtNote.push(false);
        }
        this.setupFirstSpeciesMeasureLines();
    }

    /**
     * Creates measure line objects and adds them to the scene
     * Will adjust when more species are added
     */
    setupFirstSpeciesMeasureLines(){
        let measureLine = new THREE.BoxGeometry(4,.01,.12);
        let lineMat = new THREE.MeshStandardMaterial({color: 0xFFFFFF});

        this.lineGroup = new THREE.Group();
        let linePosZ = 3.65;
        let lineSpacing = 3.5;
        let numLines = parseInt(Math.ceil(this.songLength/2));

        for(let i = 0; i < numLines; i++){
            let newMeasureLine = new THREE.Mesh(measureLine,lineMat);
            newMeasureLine.position.x = 0;
            newMeasureLine.position.y = this.spaceAboveStaff;
            newMeasureLine.position.z = linePosZ - lineSpacing;
            linePosZ = newMeasureLine.position.z;
            this.lineGroup.add(newMeasureLine);
        }
        this.arGroup.add(this.lineGroup);
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
        this.placeSceneRoot();
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
            let numVisible = 0;
            let avgPos = new THREE.Vector3();
            let quats = [];
            for (let i = 0; i < this.markerRoots.length; i++) {
                const marker = this.markerRoots[i];
                if (marker.visible) {
                    numVisible++;
                    // Devise vector from this marker to the center in 
                    // world coordinates.  This is the negative of the 
                    // relative position of the marker since it points towards
                    // the center
                    let pos = new THREE.Vector3(marker.markerPos[0]*h, 0, marker.markerPos[1]*v);
                    pos = marker.localToWorld(pos);
                    avgPos.add(pos);

                    quats.push(marker.quaternion);
                    marker.visible = false; // Set to be not visible again so it will be properly updated on the next frame
                }
            }
            if (numVisible > 0) {
                // Set marker root position to be average marker position
                avgPos.divideScalar(numVisible);
                this.arGroup.position.x = avgPos.x;
                this.arGroup.position.y = avgPos.y;
                this.arGroup.position.z = avgPos.z;
                // Set marker root orientation to be the SLERP averaged
                // quaternions of each marker
                const avgQuat = quats[0].clone();
                for (let i = 1; i < quats.length; i++) {
                    avgQuat.slerp(quats[i], 1/(1+i));
                }
                if(!this.gotPlacement){
                    if(numVisible >= 4){
                        this.startZ = this.arGroup.position.z;
                        this.gotPlacement = true;
                    }
                }
                this.arGroup.setRotationFromQuaternion(avgQuat);
            }
        }
        
    }
    
    /**
     * Updates ghost note position based on the position of the ARGROUP object in the 3D camera space
     * Checks current position to position of notes on staff
     * If user arrived at note's Z position, the music line to play will play audio
     * Then tracks the X position of user to track placement of music line
     * When the last note plays, the audio recording stops
     */
    notePositionUpdateAnalyze(){

        //Takes world coordinates of ARGROUP and provides the inverse
        //Then applies the the inverse as a transformation of the identity
        //Giving the current position of the camera, relative to the ARGROUP object
        let worldCoords = this.arGroup.matrixWorld;
        let inverseWorldCoords = worldCoords.getInverse(worldCoords);
        let transformVector = new THREE.Vector4(0,0,0,1);
        let newPosition = transformVector.applyMatrix4(inverseWorldCoords);

        //Applies new X and Z positions to the current position object based on tranformation above
        this.arGroup.children[this.AGGNI].position.x = newPosition.x;
        this.arGroup.children[this.AGGNI].position.z = newPosition.z - 2;


        let thresh = 0.1;
        let currentPosition = this.arGroup.children[this.AGGNI].position;

        //Checks position of currentPosition relative to notes on staff
        //If at Z coordinate of note, the note audio(s) will play and color is changed
        for(let i = 0; i < this.songLength; i++){
            let checkPos = 0;
            if(this.useCF){
                checkPos = this.arGroup.children[this.AGCFI].children[i].position.z;
            }else{
                checkPos = this.arGroup.children[this.AGCPI].children[i].position.z;
            }
            let dist = Math.abs(currentPosition.z - checkPos);
            //If distance is leq and the note hasn't been reached, play audio
            if((dist <= thresh) && (!this.arrivedAtNote[i])){
                console.log("At Music Note " + i);
                this.arrivedAtNote[i] = true;
                this.trackedPositions.push(currentPosition.x);
                this.changeNoteColor(i);
                if(!this.didPlayNoteAudio[i]){
                    this.didPlayNoteAudio[i] = true;
                    if(this.linesToUse[0]){
                        this.digAud.playCantFirmNote(i);
                    }
                    if(this.linesToUse[1]){
                        this.digAud.playCounterpointNote(i);
                    }
                }
            }
            if(this.arrivedAtNote[this.noteCount-1]){
                this.sampAud.stopRecording();
            }
        }
        //Allows repaint to occur, updating scene frame
        this.canRerun = true;
    }

    /**
     * Position of black color note and yellow color note changes
     * Could not implement full replacement
     * index    int
    */
    changeNoteColor(index){
        if(this.linesToUse[0]){
            this.arGroup.children[this.AGCFI].children[index].position.y = 100;
            this.arGroup.children[this.AGCFNI].children[index].position.y = this.spaceAboveStaff;
        }
        if(this.linesToUse[1]){
            this.arGroup.children[this.AGCPI].children[index].position.y = 100;
            this.arGroup.children[this.AGCPNI].children[index].position.y = this.spaceAboveStaff;
        }
    }

    /**
     * Perform an animation step, which consists of tracking the AR targets and updating
     * the global AR positions, as well as animating the scene forward in time
     */
    repaint() {
        this.canRerun = false;
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
        this.updateCalibration();
        this.sceneObj.animate(deltaTime);
        while(!this.canRerun){
            this.notePositionUpdateAnalyze();
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.repaint.bind(this));
    }

}

/*
TODO:

Note highlighting

REACH: Dynamic time warping of sung audio to match tempo

Audio On/Off function for any line of music



*/