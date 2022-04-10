/*
Markers were made using this:
https://ar-js-org.github.io/AR.js/three.js/examples/marker-training/examples/generator.html
The image size set to 2500px, pattern ratio set to .9
*/

const PATTERNS_AR = [
    {"url":"data/pattern-A.patt", "pos":[5, 0]},
    {"url":"data/pattern-B.patt", "pos":[5, 2]},
    {"url":"data/pattern-C.patt", "pos":[5, 4]},
    {"url":"data/pattern-D.patt", "pos":[5, 6]},
    {"url":"data/pattern-E.patt", "pos":[5, 8]},
    {"url":"data/pattern-F.patt", "pos":[5, 10]},
    {"url":"data/pattern-M.patt", "pos":[5, 12]},
    {"url":"data/pattern-N.patt", "pos":[5, 14]},
    {"url":"data/pattern-O.patt", "pos":[5, 16]},
    {"url":"data/pattern-P.patt", "pos":[5, 18]},
    {"url":"data/pattern-Q.patt", "pos":[5, 20]},
    {"url":"data/pattern-R.patt", "pos":[5, 22]},
    {"url":"data/pattern-G.patt", "pos":[-5, 0]},
    {"url":"data/pattern-H.patt", "pos":[-5, 2]},
    {"url":"data/pattern-I.patt", "pos":[-5, 4]},
    {"url":"data/pattern-J.patt", "pos":[-5, 6]},
    {"url":"data/pattern-K.patt", "pos":[-5, 8]},
    {"url":"data/pattern-L.patt", "pos":[-5, 10]},
    {"url":"data/pattern-S.patt", "pos":[-5, 12]},
    {"url":"data/pattern-T.patt", "pos":[-5, 14]},
    {"url":"data/pattern-U.patt", "pos":[-5, 16]},
    {"url":"data/pattern-V.patt", "pos":[-5, 18]},
    {"url":"data/pattern-W.patt", "pos":[-5, 20]},
    {"url":"data/pattern-X.patt", "pos":[-5, 22]}
];

class PositionalAR {
    /**
     * 
     * @param {object} sceneObj An object that contains the fields scene, camera, and sceneRoot,
     *                     as well as a method animate(dt)
     * @param {boolean} antialias Whether or not to do antialiasing (true by default, but can be turned off
     *                            for performance)
     */
    constructor(sceneObj, digAudio, useCantusFirmus, useCounterpoint, antialias) {
        const that = this;

        // Setup three.js WebGL renderer
        const renderer = new THREE.WebGLRenderer({antialias: antialias, alpha: true});
        this.renderer = renderer;
        renderer.setClearColor(new THREE.Color('lightgrey'), 0)
        renderer.setSize(640, 480);
        renderer.domElement.style.position = 'absolute'
        renderer.domElement.style.top = '0px'
        renderer.domElement.style.left = '0px'
        document.body.appendChild( renderer.domElement );

        //Keyboard Debugging Information
        this.keyboardDebugging = false;
        this.keyboard = new KeyboardHandler();
        if (antialias === undefined) {
            antialias = true;
        }

        //scene object information
        this.sceneObj = sceneObj;
        this.scene = this.sceneObj.scene;
        this.noteXSpace = this.scene.xSpace;
        this.camera = this.sceneObj.camera;
        this.sceneRoot = this.sceneObj.sceneRoot;
        
        //Digital Audio Information
        this.digAud = digAudio;
        this.songLength = this.digAud.songLength;
        this.SPL = this.digAud.SPL;
        this.didPlayNoteAudio = [];

        //Voice Recorder Information
        this.sampAud = new SampledAudio();

        //Tracking Information
        this.trackedPositions = [];
        this.gotOGQuat = false;
        this.gotPlacement = false;
        this.moveThresh = 6;

        //Note Information
        this.linesToUse = [useCantusFirmus, useCounterpoint];
        this.arrivedAtNote = [];
        this.currentNoteInd = 0;
        this.noteLists = [[],[]];
        this.xPositions = [[],[]];
        for(let i = 0; i < this.SPL.songLength; i++){
            this.xPositions[0].push(this.SPL.cfMaster[i].pos);
            this.noteLists[0].push(this.SPL.cfMaster[i].note);
            this.xPositions[1].push(this.SPL.cpMaster[i].pos);
            this.noteLists[1].push(this.SPL.cpMaster[i].note);
        }
        
        //Global Variables
        this.ghostColor = 0;
        this.noteColor  = 1;
        this.replaceColor = 2;
        this.noteGroupPlacement = -2;
        this.spaceAboveStaff = .1;

        //Clock and Time Information
        this.clock = new THREE.Clock();
        this.totalTime = 0;
        this.globalTimes = [];

        //End Program Information
        this.endProgram = false;
        this.madeEndScene = false;
        
        //Begin Program
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
                size: 1,
                type: 'pattern',
                patternUrl: PATTERNS_AR[i].url,
                // turn on/off camera smoothing
                smooth: true,
                // number of matrices to smooth tracking over, more = smoother but slower follow
                smoothCount: 10
                // distance tolerance for smoothing
                //if smoothThreshold # of matrices are under tolerance, tracking will stay still
                //smoothTolerance: 0.01,
                // threshold for smoothing
                //will keep still unless enough matrices are over tolerance
                //smoothThreshold: 2
                
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

    /**
     * Creates current position ghost note object
     * Added to ARGROUP as child
     */
    setupGhostNote(){
        let ghostNote = new THREE.Group();
        ghostNote.add(this.makeNoteObject(this.ghostColor));
        this.ghostNote = ghostNote;
        this.arGroup.add(ghostNote);
        this.AGGNI = this.arGroup.children.length - 1;
        this.arGroup.children[this.AGGNI].position.z = 6;
        this.arGroup.children[this.AGGNI].position.y = this.spaceAboveStaff;
    }

    makeNoteObject(ind){
        let geo = new THREE.TorusGeometry(.25, .045, 10, 24);
        geo.scale(1.25,2,1);
        geo.rotateX(1.57);
        let colors = [{color: 0xB41697},{color: 0x000000},{color: 0xF5BB00}]
        return new THREE.Mesh(geo,new THREE.MeshStandardMaterial(colors[ind]));
    }

    /**
     * Creates a collection of note objects (for cantus firmus line and/or counterpoint line)
     * Note Groups are added to ARGROUP as children
     * 2 sets of notes are created, one set on staff, other set out of view
     * Sets index number of each group as class member data
     */
    setupFirstSpeciesNotes(){

        this.CFGroup = new THREE.Group();
        this.CPGroup = new THREE.Group();

        let boolListsEmpty = true;

        for(let i = 0; i < this.linesToUse.length; i++){
            if(this.linesToUse[i]){
                let noteSpacing = 1.5;
                let notePositionZ = 1;          
                for(let j = 0; j < this.songLength; j++){
                    //primary note
                    let newNote = this.makeNoteObject(this.noteColor);
                    newNote.position.x = this.xPositions[i][j] * 0.5;
                    newNote.position.y = this.spaceAboveStaff;
                    newNote.position.z = notePositionZ - noteSpacing;
                    notePositionZ = newNote.position.z;
                    if(i==0){
                        this.CFGroup.add(newNote);
                    }else if(i==1){
                        this.CPGroup.add(newNote);
                    }
                    //fills note booleans
                    if(boolListsEmpty){
                        this.didPlayNoteAudio.push(false);
                        this.arrivedAtNote.push(false);
                    }
                }
                //stops form overfill
                boolListsEmpty = false;
                if(i==0){
                    this.arGroup.add(this.CFGroup);
                    this.AGCFI = this.arGroup.children.length - 1;
                }else if(i==1){
                    this.arGroup.add(this.CPGroup);
                    this.AGCPI = this.arGroup.children.length - 1;
                }
            }
        }
        this.setupFirstSpeciesMeasureLines();
    }

    /**
     * Creates measure line objects and adds them to the scene
     * Will adjust when more species are added
     */
    setupFirstSpeciesMeasureLines(){
        let lineGeo = new THREE.BoxGeometry(4,.01,.05);
        let lineMat = new THREE.MeshStandardMaterial({color: 0xFFFFFF});
        let lineGroup = new THREE.Group();

        let linePosZ = .25;
        let lineSpacing = 3;
        let numLines = parseInt(Math.ceil(this.songLength/2));

        for(let i = 0; i < numLines; i++){
            let newLine = new THREE.Mesh(lineGeo,lineMat);
            newLine.position.x = 0;
            newLine.position.y = this.spaceAboveStaff;
            newLine.position.z = linePosZ - lineSpacing;
            linePosZ = newLine.position.z;
            lineGroup.add(newLine);
        }
        let newLine = new THREE.Mesh(lineGeo,lineMat);
        newLine.position.x = 0;
        newLine.position.y = this.spaceAboveStaff;
        newLine.position.z = linePosZ + .25;
        lineGroup.add(newLine);
        this.arGroup.add(lineGroup);
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
        
        let X = Math.abs(this.arGroup.children[this.AGGNI].position.x - newPosition.x);
        let Z = Math.abs(this.arGroup.children[this.AGGNI].position.z - newPosition.z);

        if(X < this.moveThresh && Z < this.moveThresh){
            this.arGroup.children[this.AGGNI].position.x = newPosition.x;
            this.arGroup.children[this.AGGNI].position.z = newPosition.z - 2;
        }

        let thresh = 0.1;
        let currentPosition = this.arGroup.children[this.AGGNI].position;

        //Checks position of currentPosition relative to notes on staff
        //If at Z coordinate of note, the note audio(s) will play and color is changed

        let checkPos = 0;
        if(this.linesToUse[0]){
            checkPos = this.arGroup.children[this.AGCFI].children[this.currentNoteInd].position.z;
        }else{
            checkPos = this.arGroup.children[this.AGCPI].children[this.currentNoteInd].position.z;
        }
        let dist = Math.abs(currentPosition.z - checkPos);

        //If distance is leq and the note hasn't been reached, play audio
        if((dist <= thresh) && (!this.arrivedAtNote[this.currentNoteInd])){
            console.log("At Music Note " + this.currentNoteInd);
            this.arrivedAtNote[this.currentNoteInd] = true;
            this.trackedPositions.push(currentPosition.x);
            this.globalTimes.push(Date.now());
            this.changeNoteColor(this.currentNoteInd);
            if(!this.didPlayNoteAudio[this.currentNoteInd]){
                this.didPlayNoteAudio[this.currentNoteInd] = true;
                if(this.linesToUse[0]){
                    this.digAud.playCantFirmNote(this.currentNoteInd);
                }
                if(this.linesToUse[1]){
                    this.digAud.playCounterpointNote(this.currentNoteInd);
                }
            }
            this.currentNoteInd++;
        }


        if(this.currentNoteInd >= this.songLength){
            console.log("finished");
            this.sampAud.stopRecording();
            this.endProgram = true;
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
            this.arGroup.children[this.AGCFI].children[index].material = new THREE.MeshStandardMaterial({color: 0xF5BB00});
        }
        
        if(this.linesToUse[1]){
            this.arGroup.children[this.AGCPI].children[index].material = new THREE.MeshStandardMaterial({color: 0xF5BB00});
        }
    }

    /**
     * Perform an animation step, which consists of tracking the AR targets and updating
     * the global AR positions, as well as animating the scene forward in time
     */
    repaint() {
        if(!this.gotOGQuat){
            this.OGQuat = this.arGroup.getWorldQuaternion();
            this.gotOGQuat = true;
            this.sampAud.startRecording();
            this.timeOffset = Date.now();
        }
        this.canRerun = false;
        if ( this.arToolkitSource.initialized !== false ) {
            this.arToolkitContext.update( this.arToolkitSource.domElement );
        }
        this.updateCalibration();
        let deltaTime = this.clock.getDelta();
        if (this.totalTime < 6 && (this.totalTime+deltaTime)%1 < this.totalTime%1) {
            // A hack to trigger resizing every second for the first 5 seconds
            // TODO: Try something more elegant?
            this.onResize();
        }else{
            while(!this.canRerun){
                this.notePositionUpdateAnalyze();
            }
        }
        this.totalTime += deltaTime;
        this.sceneObj.animate(deltaTime);

        if(this.endProgram){
            this.analyzeCollectedData();
        }else{
            this.renderer.render(this.scene, this.camera);
            requestAnimationFrame(this.repaint.bind(this));
        }
    }

    /**
     * POST TRAVERSAL METHODS
     */

    analyzeCollectedData(){
        let formattedPositions = [];
        for(let i = 0; i < this.trackedPositions.length; i++){
            let actual = this.trackedPositions[i];
            let low = Math.floor(actual);
            let high = Math.ceil(actual);
            let mid = (high-low)/2 + low;
            let ops = [Math.abs(low-actual),Math.abs(mid-actual),Math.abs(high-actual)];
            let choice = [low,mid,high];
            let lowest = 0;
            for(let j = 1; j < ops.length; j++){if(ops[j] < ops[lowest]){lowest = j;}}
            formattedPositions.push(choice[lowest]);
        }
        let noteResults = [];
        let NPL = Object.entries(this.SPL.possibilitiesDic);
        for(let i = 0; i < formattedPositions.length; i++){
            for(let j = 0; j < NPL.length; j++){
                if(formattedPositions[i] == NPL[j][1]*0.5){
                    noteResults.push(NPL[j][0]);
                    j = NPL.length;
                }
            }
        }
        let offset = this.timeOffset;
        for(let i = 0; i < this.globalTimes.length; i++){
            this.globalTimes[i] -= offset;
        }
        this.formattedPositions = formattedPositions;
        this.noteResults = noteResults;
        this.createEndScene();
        this.renderer.render(this.scene, this.camera);
        this.userMP3Aud = [];
        this.mp3UserNoteSetup(noteResults);
        let playEnd = false;
        while(!playEnd){
            if(this.gotMP3){
                this.playUserChoice();
                playEnd = true;
            }
        }
    }

    createEndScene(){
        this.arGroup.setRotationFromQuaternion(this.OGQuat);
        this.arGroup.remove(this.ghostNote);
        this.arGroup.rotateX(1.57);
        this.arGroup.rotateY(-1.57);
        this.arGroup.rotateZ(0.35);
        this.arGroup.position.x = -7;
        this.arGroup.position.y = 0;
        this.arGroup.position.z = -22.5;

        //createbackground
        let backG = new THREE.BoxGeometry(50,0.1,70);
        let backM = new THREE.MeshStandardMaterial({color: 0x000000});
        let backGround = new THREE.Mesh(backG,backM);
        backGround.position.y = -10;
        this.arGroup.add(backGround);

        //add user positions
        let noteSpacing = 1.5;
        let notePositionZ = 1;
        let resGroup = new THREE.Group();
        for(let i = 0; i < this.formattedPositions.length; i++){
            let newNote = this.makeNoteObject(this.ghostColor);
            newNote.position.x = this.formattedPositions[i];
            newNote.position.y = 1000;
            newNote.position.z = notePositionZ - noteSpacing;
            notePositionZ = newNote.position.z;
            resGroup.add(newNote);
        }
        this.arGroup.add(resGroup);
        this.NNGI = this.arGroup.children.length - 1;
    }

    mp3UserNoteSetup(noteResults){
        for(let i = 0; i < noteResults.length; i++){
            let note = noteResults[i];
            let pDir = "notes/half/"+note+".mp3";
            let sampAud = new Audio(pDir);
            this.userMP3Aud.push(sampAud);
        }
        this.gotMP3 = true;
    }

    playUserNote(noteNumber){
        if(this.userMP3Aud[noteNumber].readyState >= 2){
            this.userMP3Aud[noteNumber].play();
            //console.log("played note");
        }else{
            this.userMP3Aud[noteNumber].addEventListener('loadeddata', function(){
                that.userMP3Aud[noteNumber].play();
                //console.log("played note");
            });
        }
    }
    
    playUserChoice(){
        //this.sampAud.playAudio();
        for(let i = 0; i < this.globalTimes.length; i++){
            setTimeout(() => {
                this.arGroup.children[this.NNGI].children[i].position.y = this.spaceAboveStaff;
                if(this.linesToUse[0]){
                    this.digAud.playCantFirmNote(i);
                }
                if(this.linesToUse[1]){
                    this.digAud.playCounterpointNote(i);
                }
                this.playUserNote(i);
                this.renderer.render(this.scene, this.camera);
            }, this.globalTimes[i])
        }
    }

}