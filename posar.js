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

/**
 * @exports PositionalAR
 * @constructor
 * 
 * @param {BasicScene} sceneObj
 * @param {DAGenerator} digitalAudio
 * @param {boolean} useCantusFirmus
 * @param {boolean} useCounterpoint
 */
function PositionalAR(sceneObj, digitalAudio, useCantusFirmus, useCounterpoint){
    const that = this;
    this.setupRenderer(true);
    this.setupScene(sceneObj);
    this.setupDigitalAudio(digitalAudio);
    this.setupNoteInformation(useCantusFirmus,useCounterpoint);
    this.initializeGlobalVariables();
    this.setupMarkerTracker();
    this.setupGhostNote();
    this.setupFirstSpeciesNotes();
    this.setupFirstSpeciesMeasureLines();
    this.setupColorTracking();
    this.setupRayCasting();
    this.repaint();
};

//////////////////////////////////////////////////////////////////////////////////////////////
// COLOR AND MARKER TRACKER SETUP
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Setup Color Tracking library (tracking.js)
 */
 PositionalAR.prototype.setupColorTracking = function(){
    const that = this;
    var colors = new tracking.ColorTracker(['yellow']);
    colors.on('track', function(event){
        if(event.data.length === 0){
            // No colors were detected in this frame.
            //console.log("is working");
        }else{
            event.data.forEach(function(rect){
                //console.log(rect.x, rect.y, rect.height, rect.width, rect.color);
                //TODO: make this in relative coordinates to global coords of ARMarkers
                that.colorTrackX = (rect.x/that.colorCamW)*that.wX;// + (rect.width/2);
                that.colorTrackY = (rect.y/that.colorCamH)*that.wY;// + (rect.height/2);
                that.p.style.left = that.colorTrackX + "px";
                that.p.style.top = that.colorTrackY + "px";

                //console.log("gang");
                console.log(that.colorTrackX,that.colorTrackY);
            });
        }
    });
    this.colorT = colors;
    setTimeout(() => {
        tracking.track(this.createColorTrackCamera(), this.colorT);
        this.createAuxilaryDOMElement();
        this.getRatiosOfProgram();
    }, 2000);
}

PositionalAR.prototype.getRatiosOfProgram = function(){
    let ctWS = document.getElementById('colorTrackVideo').style.width;
    let ctHS = document.getElementById('colorTrackVideo').style.height;
    this.colorCamW = parseInt(ctHS.substring(0,ctHS.indexOf('p')));
    this.colorCamH = parseInt(ctWS.substring(0,ctWS.indexOf('p')));
    this.wX = window.innerWidth;
    this.wY = window.innerHeight;
}

PositionalAR.prototype.createAuxilaryDOMElement = function(){
    let p = document.createElement("p");
    document.body.appendChild(p);
    p.style.backgroundColor = "red";
    p.style.innerHTML = "*";
    p.style.position = 'absolute';
    p.style.width = "40px";
    p.style.height = "40px";
    p.style.zIndex = 10;
    p.style.left = "0px"
    p.style.top = "0px";  
    this.p = p;
}

/**
 * 
 */
PositionalAR.prototype.createColorTrackCamera = function(){
    const colorTrackerVideo = document.querySelector("video");
    let constraints = {video:true};
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        colorTrackerVideo.srcObject = stream;
    });
    document.getElementById('colorTrackVideo').style.visibility = "hidden";
    return colorTrackerVideo;
}

/**
 * 
 */
PositionalAR.prototype.setupMarkerTracker = function(){
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
        markerRoot.name = "Marker Root " + i;
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
    this.arGroup.add(this.sceneRoot);
    this.scene.add(this.arGroup);
};

//////////////////////////////////////////////////////////////////////////////////////////////
// OTHER SETUP FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @param {boolean} antialias
 */
 PositionalAR.prototype.setupRenderer = function(antialias){
    // Setup three.js WebGL renderer
    const renderer = new THREE.WebGLRenderer({antialias: antialias, alpha: true});
    this.renderer = renderer;
    renderer.setClearColor(new THREE.Color('lightgrey'), 0)
    renderer.setSize(640, 480);
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.top = '0px'
    renderer.domElement.style.left = '0px'
    document.body.appendChild( renderer.domElement );
};

/**
 * @param {BasicScene} sceneObj
 */
PositionalAR.prototype.setupScene = function(sceneObj){
    this.sceneObj = sceneObj;
    this.scene = this.sceneObj.scene;
    this.camera = this.sceneObj.camera;
    this.sceneRoot = this.sceneObj.sceneRoot;
    this.sceneRoot.name = "Scene Root";
    this.noteXSpace = this.scene.xSpace;

};

/**
 * @param {DAGenerator} digitalAudio
 */
PositionalAR.prototype.setupDigitalAudio = function(digitalAudio){
    this.digAud = digitalAudio;
    this.songLength = this.digAud.songLength;
    this.SPL = this.digAud.SPL;
};

/**
 * @param {boolean} useCantusFirmus
 * @param {boolean} useCounterpoint
 */
PositionalAR.prototype.setupNoteInformation = function(useCantusFirmus,useCounterpoint){
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
};

/**
 * 
 */
PositionalAR.prototype.initializeGlobalVariables = function(){

    this.arGroup = new THREE.Group();
    this.arGroup.name = "AR Group";
    this.sampAud = new SampledAudio();
    this.clock = new THREE.Clock();

    this.colors = [{color: 0xB41697},{color: 0x000000},{color: 0xF5BB00}];
    this.globalTimes = [];
    this.didPlayNoteAudio = [];
    this.trackedPositions = [];
    
    this.endTracking = false;
    this.madeEndScene = false;
    this.gotOGQuat = false;
    this.gotPlacement = false;
    
    this.moveThresh = 6;
    this.ghostColor = 0;
    this.noteColor  = 1;
    this.replaceColor = 2;
    this.noteGroupPlacement = -2;
    this.spaceAboveStaff = .1;
    this.totalTime = 0;

    this.colorTrackX = 0;
    this.colorTrackY = 0;

    this.AGCFI = null;
    this.AGCPI = null;
    this.AGGNI = null;
    this.NNGI = null;
};

/**
 * 
 */
PositionalAR.prototype.setupGhostNote = function(){
    let ghostNote = new THREE.Group();
    ghostNote.name = "Ghost Note";
    ghostNote.add(this.makeNoteObject(this.ghostColor));
    this.ghostNote = ghostNote;
    this.arGroup.add(ghostNote);
    this.AGGNI = this.arGroup.children.length - 1;
    this.arGroup.children[this.AGGNI].position.z = 6;
    this.arGroup.children[this.AGGNI].position.y = this.spaceAboveStaff;
};

/**
 * 
 */
PositionalAR.prototype.setupFirstSpeciesNotes = function(){
    this.CFGroup = new THREE.Group();
    this.CFGroup.name = "CantusFirmus Group";
    this.CPGroup = new THREE.Group();
    this.CPGroup.name = "Counterpoint Group";
    for(let i = 0; i < this.linesToUse.length; i++){
        let noteSpacing = 1.5;
        let notePositionZ = 1;
        if(this.linesToUse[i]){              
            for(let j = 0; j < this.songLength; j++){
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
                if(this.didPlayNoteAudio.length < this.songLength){
                    this.didPlayNoteAudio.push(false);
                    this.arrivedAtNote.push(false);
                }
            }
        }
    }
    this.arGroup.add(this.CFGroup);
    this.AGCFI = this.arGroup.children.length - 1;
    this.arGroup.add(this.CPGroup);
    this.AGCPI = this.arGroup.children.length - 1;
};

/**
 * 
 */
PositionalAR.prototype.setupFirstSpeciesMeasureLines = function(){
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
    lineGroup.name = "Line Group";
    this.arGroup.add(lineGroup);
};

/**
 * 
 */
 PositionalAR.prototype.setupRayCasting = function(){
    this.raycast = new THREE.Raycaster();
    this.point = new THREE.Vector2();

    let geo = new THREE.TorusGeometry(.25, .045, 10, 24);
    geo.scale(0.5,0.5,0.5);
    geo.rotateX(1.57);
    
    let pointP = new THREE.Mesh(geo,new THREE.MeshStandardMaterial(this.colors[1]));
    pointP.position.z = -5;
    this.ng = new THREE.Group();
    this.ng.add(pointP);
    this.scene.add(this.ng);

}

//////////////////////////////////////////////////////////////////////////////////////////////
// Main Program Functions
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 
 */
PositionalAR.prototype.repaint = function(){
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
    //this.arGroup.position.z = -20;
    //this.arGroup.rotateX(.01);
    if(this.endTracking){
        this.endProgram();
    }else{
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.repaint.bind(this));
    }
    
};

/**
 * Update a running average of the horizontal interval and vertical
 * interval between adjacent markers based on which markers are visible
 */
PositionalAR.prototype.updateCalibration = function(){
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
PositionalAR.prototype.placeSceneRoot = function(){
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
};


PositionalAR.prototype.rayCast = function(){

    //console.log(this.colorTrackX,this.colorTrackY);
    let newX = (this.colorTrackX/this.colorCamW)*this.arCamW;
    let newY = (this.colorTrackY/this.colorCamH)*this.arCamH;
    console.log(newX,newY);

    /*
    this.ng.position.z = 0;
    this.ng.position.x = (this.colorTrackX - (this.colorTrackX/2))/100;
    this.ng.position.y = (this.colorTrackY - (this.colorTrackY/2))/100;
    console.log(this.ng.position);
    */
    //this.point.x = this.colorTrackX * this.xCamScale;
    //this.point.y = this.colorTrackY * this.yCamScale;
    /*
    this.point.x = ((2.0 / this.colorCamW) * this.colorTrackX)-1;
    this.point.y = ((2.0 / this.colorCamH) * this.colorTrackY)-1;
    console.log(this.point.x,this.point.y);
    this.raycast.setFromCamera(this.point,this.camera);
    const intersects = this.raycast.intersectObjects(this.sceneObj.sceneRoot.children);
    
    if(intersects.length > 0){console.log(intersects);}
    */
    //return intersects;
}


/**
 * Updates ghost note position based on the position of the ARGROUP object in the 3D camera space
 * Checks current position to position of notes on staff
 * If user arrived at note's Z position, the music line to play will play audio
 * Then tracks the X position of user to track placement of music line
 * When the last note plays, the audio recording stops
 */
PositionalAR.prototype.notePositionUpdateAnalyze = function(){
    //Takes world coordinates of ARGROUP and provides the inverse
    //Then applies the the inverse as a transformation of the identity
    //Giving the current position of the camera, relative to the ARGROUP object

    //needed position
    let currentPosition = this.rayCast();


    //old code for current position
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
    //end of old current position code


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
        this.endTracking = true;
    }
    //Allows repaint to occur, updating scene frame
    this.canRerun = true;
};

//////////////////////////////////////////////////////////////////////////////////////////////
// End Program Functions
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 
 */
PositionalAR.prototype.endProgram = function(){
    this.stopColorTracking();
    this.formatPositions();
    this.digAud.getNoteResults(this.formattedPositions);
    this.createEndScene();
    this.digAud.mp3UserNoteSetup();
    this.playUserChoice();
};

/**
 * 
 */
PositionalAR.prototype.stopColorTracking = function(){
    this.colorT.removeAllListeners();
}

/**
 * 
 */
 PositionalAR.prototype.formatPositions = function(){
    this.formattedPositions = [];
    for(let i = 0; i < this.trackedPositions.length; i++){
        let actual = this.trackedPositions[i];
        let low = Math.floor(actual);
        let high = Math.ceil(actual);
        let mid = (high-low)/2 + low;
        let ops = [Math.abs(low-actual),Math.abs(mid-actual),Math.abs(high-actual)];
        let choice = [low,mid,high];
        let lowest = 0;
        for(let j = 1; j < ops.length; j++){if(ops[j] < ops[lowest]){lowest = j;}}
        this.formattedPositions.push(choice[lowest]);
    }
}

/**
 * 
 */
PositionalAR.prototype.createEndScene = function(){
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
    let backM = new THREE.MeshStandardMaterial(this.colors[this.noteColor]);
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
    this.renderer.render(this.scene, this.camera);
};

/**
 * 
 */
PositionalAR.prototype.playUserChoice = function(){
    //this.sampAud.playAudio();
    for(let i = 0; i < this.globalTimes.length; i++){
        this.globalTimes[i] -= this.timeOffset;
    }
    for(let i = 0; i < this.globalTimes.length; i++){
        setTimeout(() => {
            this.arGroup.children[this.NNGI].children[i].position.y = this.spaceAboveStaff;
            if(this.linesToUse[0]){
                this.digAud.playCantFirmNote(i);
            }
            if(this.linesToUse[1]){
                this.digAud.playCounterpointNote(i);
            }
            this.digAud.playUserNote(i);
            this.renderer.render(this.scene, this.camera);
        }, this.globalTimes[i])
    }
}

//////////////////////////////////////////////////////////////////////////////////////////////
//  Helper Functions
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @param {Int} index
 */
PositionalAR.prototype.makeNoteObject = function(index){
    let geo = new THREE.TorusGeometry(.25, .045, 10, 24);
    geo.scale(1.25,2,1);
    geo.rotateX(1.57);
    return new THREE.Mesh(geo,new THREE.MeshStandardMaterial(this.colors[index]));
};

/**
 * @param {Int} index
 */
PositionalAR.prototype.changeNoteColor = function(index){
    if(this.linesToUse[0]){
        this.arGroup.children[this.AGCFI].children[index].material= 
        new THREE.MeshStandardMaterial(this.colors[this.replaceColor]);
    }
    if(this.linesToUse[1]){
        this.arGroup.children[this.AGCPI].children[index].material= 
        new THREE.MeshStandardMaterial(this.colors[this.replaceColor]);
    }
};

/**
 * 
 */
PositionalAR.prototype.onResize = function(){
    this.arToolkitSource.onResizeElement();
    this.arToolkitSource.copyElementSizeTo(this.renderer.domElement);
    if (this.arToolkitContext.arController !== null) {
        this.arToolkitSource.copyElementSizeTo(this.arToolkitContext.arController.canvas);
    }
};

/**
 * @param {?} el
 */
PositionalAR.prototype.enterFullscreen = function(el){
    if (el.requestFullscreen) {
        el.requestFullscreen();
        } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
        } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
        } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
        }
};