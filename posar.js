/**
 * @exports CounterpointCanvas
 * @constructor
 * 
 * @param {BasicScene} sceneObj
 * @param {DAGenerator} digitalAudio
 * @param {boolean} useCantusFirmus
 * @param {boolean} useCounterpoint
 */
function CounterpointCanvas(sceneObj, digitalAudio, useCantusFirmus, useCounterpoint){
    const that = this;
    this.sceneObj = sceneObj;
    this.setupDigitalAudio(digitalAudio);
    this.setupNoteInformation(useCantusFirmus,useCounterpoint);
    this.initializeGlobalVariables();
    this.setupMarkerTracker();
    this.setupGhostNote();
    this.setupFirstSpeciesNotes();
    this.setupFirstSpeciesMeasureLines();
    this.setupColorTracking();
    this.repaint();
};

//////////////////////////////////////////////////////////////////////////////////////////////
// OTHER SETUP FUNCTIONS
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * @param {DAGenerator} digitalAudio
 * 
 * Setup/ instantiation of the digital audio global variables
 */
CounterpointCanvas.prototype.setupDigitalAudio = function(digitalAudio){
    this.digAud = digitalAudio;
    this.songLength = this.digAud.songLength;
    this.SPL = this.digAud.SPL;
};

/**
 * @param {boolean} useCantusFirmus
 * @param {boolean} useCounterpoint
 * 
 * Retreives the x position and note lists of each used music line from the SPL object
 */
CounterpointCanvas.prototype.setupNoteInformation = function(useCantusFirmus,useCounterpoint){
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
 * Initializes the global variables
 */
CounterpointCanvas.prototype.initializeGlobalVariables = function(){

    this.sceneRoot = new THREE.Group();
    this.sceneRoot.name = "AR Group";
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
 * DEPRICATED(Soon)
 * 
 * Setup of the current position ghost note tracker 
 */
CounterpointCanvas.prototype.setupGhostNote = function(){
    let ghostNote = new THREE.Group();
    ghostNote.name = "Ghost Note";
    ghostNote.add(this.makeNoteObject(this.ghostColor));
    this.ghostNote = ghostNote;
    this.sceneRoot.add(ghostNote);
    this.AGGNI = this.sceneRoot.children.length - 1;
    this.sceneRoot.children[this.AGGNI].position.z = 6;
    this.sceneRoot.children[this.AGGNI].position.y = this.spaceAboveStaff;
};

/**
 * Creates and adds note objects to the AR scene based on the x position of the notes
 * 
 * (will need a different function for higher order species)
 */
CounterpointCanvas.prototype.setupFirstSpeciesNotes = function(){
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
    this.sceneRoot.add(this.CFGroup);
    this.AGCFI = this.sceneRoot.children.length - 1;
    this.sceneRoot.add(this.CPGroup);
    this.AGCPI = this.sceneRoot.children.length - 1;
};

/**
 * Creates and adds measure lines to the AR scene
 * 
 * (will need a different function for higher order species)
 */
CounterpointCanvas.prototype.setupFirstSpeciesMeasureLines = function(){
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
    this.sceneRoot.add(lineGroup);
};

//////////////////////////////////////////////////////////////////////////////////////////////
// Main Program Functions
//////////////////////////////////////////////////////////////////////////////////////////////

/**
 * 
 */
CounterpointCanvas.prototype.repaint = function(){
    if(!this.gotOGQuat){
        this.OGQuat = this.sceneRoot.getWorldQuaternion();
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
    //this.sceneRoot.position.z = -20;
    //this.sceneRoot.rotateX(.01);
    if(this.endTracking){
        this.endProgram();
    }else{
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.repaint.bind(this));
    }
    
};



/**
 * Updates ghost note position based on the position of the sceneRoot object in the 3D camera space
 * Checks current position to position of notes on staff
 * If user arrived at note's Z position, the music line to play will play audio
 * Then tracks the X position of user to track placement of music line
 * When the last note plays, the audio recording stops
 */
CounterpointCanvas.prototype.notePositionUpdateAnalyze = function(){
    //Takes world coordinates of sceneRoot and provides the inverse
    //Then applies the the inverse as a transformation of the identity
    //Giving the current position of the camera, relative to the sceneRoot object

    //needed position
    let currentPosition = this.rayCast();


    //old code for current position
    let worldCoords = this.sceneRoot.matrixWorld;
    let inverseWorldCoords = worldCoords.getInverse(worldCoords);
    let transformVector = new THREE.Vector4(0,0,0,1);
    let newPosition = transformVector.applyMatrix4(inverseWorldCoords);
    //Applies new X and Z positions to the current position object based on tranformation above
    let X = Math.abs(this.sceneRoot.children[this.AGGNI].position.x - newPosition.x);
    let Z = Math.abs(this.sceneRoot.children[this.AGGNI].position.z - newPosition.z);
    if(X < this.moveThresh && Z < this.moveThresh){
        this.sceneRoot.children[this.AGGNI].position.x = newPosition.x;
        this.sceneRoot.children[this.AGGNI].position.z = newPosition.z - 2;
    }
    let thresh = 0.1;
    currentPosition = this.sceneRoot.children[this.AGGNI].position;
    //end of old current position code


    //Checks position of currentPosition relative to notes on staff
    //If at Z coordinate of note, the note audio(s) will play and color is changed
    let checkPos = 0;
    if(this.linesToUse[0]){
        checkPos = this.sceneRoot.children[this.AGCFI].children[this.currentNoteInd].position.z;
    }else{
        checkPos = this.sceneRoot.children[this.AGCPI].children[this.currentNoteInd].position.z;
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
 * Function stops the tracking processes and sets up program results
 */
CounterpointCanvas.prototype.endProgram = function(){
    this.stopColorTracking();
    this.formatPositions();
    this.digAud.getNoteResults(this.formattedPositions);
    this.createEndScene();
    this.digAud.mp3UserNoteSetup();
    this.playUserChoice();
};

/**
 * Removes the tracking event listener for color tracking
 */
CounterpointCanvas.prototype.stopColorTracking = function(){
    this.colorT.removeAllListeners();
}

/**
 * Function to format the user positions tracked while traversing the scene
 * Will snap a position to either a line in the scene or the exact middle of two lines in the scene.
 */
 CounterpointCanvas.prototype.formatPositions = function(){
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
 * Creates the end scene for viewing user progress and traversal
 */
CounterpointCanvas.prototype.createEndScene = function(){
    this.sceneRoot.setRotationFromQuaternion(this.OGQuat);
    this.sceneRoot.remove(this.ghostNote);
    this.sceneRoot.rotateX(1.57);
    this.sceneRoot.rotateY(-1.57);
    this.sceneRoot.rotateZ(0.35);
    this.sceneRoot.position.x = -7;
    this.sceneRoot.position.y = 0;
    this.sceneRoot.position.z = -22.5;

    //createbackground
    let backG = new THREE.BoxGeometry(50,0.1,70);
    let backM = new THREE.MeshStandardMaterial(this.colors[this.noteColor]);
    let backGround = new THREE.Mesh(backG,backM);
    backGround.position.y = -10;
    this.sceneRoot.add(backGround);

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
    this.sceneRoot.add(resGroup);
    this.NNGI = this.sceneRoot.children.length - 1;
    this.renderer.render(this.scene, this.camera);
};

/**
 * Plays the music lines (counterpoint and/or cantus firmus, as well as the user position notes) simultaneously based on time
 * tracked in the traversal.
 */
CounterpointCanvas.prototype.playUserChoice = function(){
    //this.sampAud.playAudio();
    for(let i = 0; i < this.globalTimes.length; i++){
        this.globalTimes[i] -= this.timeOffset;
    }
    for(let i = 0; i < this.globalTimes.length; i++){
        setTimeout(() => {
            this.sceneRoot.children[this.NNGI].children[i].position.y = this.spaceAboveStaff;
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
 * 
 * returns a THREE.Mesh note object in the color defined by the input index param
 */
CounterpointCanvas.prototype.makeNoteObject = function(index){
    let geo = new THREE.TorusGeometry(.25, .045, 10, 24);
    geo.scale(1.25,2,1);
    geo.rotateX(1.57);
    return new THREE.Mesh(geo,new THREE.MeshStandardMaterial(this.colors[index]));
};

/**
 * @param {Int} index
 * 
 * Changes the color of the notes from black to gold when you pass them by while traversing the scene
 */
CounterpointCanvas.prototype.changeNoteColor = function(index){
    if(this.linesToUse[0]){
        this.sceneRoot.children[this.AGCFI].children[index].material= 
        new THREE.MeshStandardMaterial(this.colors[this.replaceColor]);
    }
    if(this.linesToUse[1]){
        this.sceneRoot.children[this.AGCPI].children[index].material= 
        new THREE.MeshStandardMaterial(this.colors[this.replaceColor]);
    }
};
