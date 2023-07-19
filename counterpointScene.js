import * as THREE from 'three';

class CounterpointScene {

    /**
     * @exports CounterpointScene
     * @constructor
     * 
     * @param {objecte} notes
     * @param {DAGenerator} digitalAudio
     * @param {boolean} useCantusFirmus
     * @param {boolean} useCounterpoint
     */
    constructor(notes, digitalAudio, params) {
        this.notes = notes;
        this.initializeGlobalVariables(params);
        this.setupDigitalAudio(digitalAudio);
        this.setupNoteInformation();
        this.setupStaff();
        this.setupGhostNote();
        this.setupFirstSpeciesNotes();
        this.setupFirstSpeciesMeasureLines();
    }


    /**
     * Initializes the global variables
     */
     initializeGlobalVariables(params) {
        const defaultParams = {
            useCounterpoint:true,
            useCantusFirmus:true,
            
            markerSize: 0.1746, // Size of marker, in meters
            staffLineWidth: 0.025, // Width of staff line, in meters
            staffSemiLength: 0.7, // Length of part of staff, in meters
            staffLineSpacing: 0.15, // Width between staff lines, in meters

            noteWidth: 0.1, // Width of note torus, in meters
            
            spaceAboveStaff: 0.1,

            moveThresh:6,
            
            ghostColor:0,
            noteColor:1,
            replaceColor:2,
        }
        for (let param in defaultParams) {
            if (param in params) {
                this[param] = params[param];
            }
            else {
                this[param] = defaultParams[param];
            }
        }
        this.noteSpacing = this.noteWidth*2;

        this.sceneRoot = new THREE.Group();
        this.scaleRoot = new THREE.Group();
        this.sceneRoot.add(this.scaleRoot);
        const fac = 1/this.markerSize;
        this.scaleRoot.scale.x = fac;
        this.scaleRoot.scale.y = fac;
        this.scaleRoot.scale.z = fac;

        this.sampAud = new SampledAudio();
        this.colors = [{color: 0xB41697},{color: 0x000000},{color: 0xF5BB00}];
        this.matColor = [{color: 0xFFFFFF},{color: 0xFFFFFF},{color: 0xff0000},{color: 0xffA500},
            {color: 0x33F3FF},{color: 0x00ff00},{color: 0x0000ff}];
        this.globalTimes = [];
        this.didPlayNoteAudio = [];
        this.trackedPositions = [];
        
        this.endTracking = false;
        this.madeEndScene = false;
        this.started = false;
        this.gotPlacement = false;
        this.totalTime = 0;
    }

    //////////////////////////////////////////////////////
    // OTHER SETUP FUNCTIONS
    //////////////////////////////////////////////////////

    /**
     * @param {DAGenerator} digitalAudio
     * 
     * Setup/ instantiation of the digital audio global variables
     */
    setupDigitalAudio(digitalAudio) {
        this.digAud = digitalAudio;
        this.songLength = this.digAud.songLength;
        this.SPL = this.digAud.SPL;
    }

    /**
     * @param {boolean} useCantusFirmus
     * @param {boolean} useCounterpoint
     * 
     * Retreives the x position and note lists of each used music line from the SPL object
     */
    setupNoteInformation() {
        this.linesToUse = [this.useCantusFirmus, this.useCounterpoint];
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
    }

    /**
     * Make time sig and clef scene objects
     */
    setupStaff() {
        let ret = this.notes.formatInfo();
        this.timeSig = ret[0];
        this.clef = ret[1];

        let staffGroup = new THREE.Group();
        staffGroup.name = "Staff Group";
        this.partialStaff = new THREE.BoxGeometry(this.staffLineWidth,this.staffSemiLength,this.staffLineWidth/4);
        const N = this.matColor.length; // TODO: Set number based on notes chosen
        for (let column = 0; column < 7; column++) {
            let newCol = new THREE.Group();
            newCol.name = "Column " + column;
            for(let i = 0; i < N; i++){
                if(column == 0 || column == 6){
                    let invmat = new THREE.MeshBasicMaterial({color: 0x000000});
                    invmat.visible = false;
                    newCol.add(new THREE.Mesh(this.partialStaff,invmat));
                }else{
                    newCol.add(new THREE.Mesh(this.partialStaff, 
                    new THREE.MeshBasicMaterial({color: this.matColor[i].color})));
                }
                newCol.children[i].position.x = -3.5*this.staffLineSpacing;
                newCol.children[i].position.y = this.staffSemiLength*i - N*this.staffSemiLength/2;
            }
            newCol.position.x += column*this.staffLineSpacing;
            staffGroup.add(newCol);
        }
        this.scaleRoot.add(staffGroup);
    }
    
    /**
     * DEPRICATED(Soon)
     * 
     * Setup of the current position ghost note tracker 
     */
    setupGhostNote() {
        let ghostNote = new THREE.Group();
        ghostNote.name = "Ghost Note";
        ghostNote.add(this.makeNoteObject(this.ghostColor));
        this.ghostNote = ghostNote;
        this.scaleRoot.add(ghostNote);
        this.ghostNote.position.z = 6;
        this.ghostNote.position.y = this.spaceAboveStaff;
    }

    /**
     * Creates and adds note objects to the AR scene based on the x position of the notes
     * 
     * (will need a different function for higher order species)
     */
    setupFirstSpeciesNotes() {
        console.log(this.xPositions);
        this.CFGroup = new THREE.Group();
        this.CFGroup.name = "CantusFirmus Group";
        this.CPGroup = new THREE.Group();
        this.CPGroup.name = "Counterpoint Group";
        for(let i = 0; i < this.linesToUse.length; i++){
            let notePositionY = -this.staffSemiLength/2;
            if(this.linesToUse[i]){              
                for(let j = 0; j < this.songLength; j++){
                    let newNote = this.makeNoteObject(this.noteColor);
                    newNote.position.x = this.staffLineSpacing*(this.xPositions[i][j]/2 - 0.5);
                    newNote.position.y = notePositionY + this.noteSpacing;
                    newNote.position.z = this.spaceAboveStaff;
                    notePositionY = newNote.position.y;
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
        this.scaleRoot.add(this.CFGroup);
        this.scaleRoot.add(this.CPGroup);
    }

    /**
     * Creates and adds measure lines to the AR scene
     * 
     * (will need a different function for higher order species)
     */
    setupFirstSpeciesMeasureLines() {
        let lineGeo = new THREE.BoxGeometry(this.staffLineSpacing*4,this.staffLineWidth/2,this.staffLineWidth/10);
        let lineMat = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
        let lineGroup = new THREE.Group();

        let linePosY = -this.staffSemiLength/2 + this.noteSpacing/2;
        let lineSpacing = this.noteSpacing*2;
        let numLines = parseInt(Math.ceil(this.songLength/2));

        for(let i = 0; i < numLines; i++){
            let newLine = new THREE.Mesh(lineGeo,lineMat);
            newLine.position.x = -this.staffLineSpacing/2;
            newLine.position.y = linePosY + lineSpacing;
            newLine.position.z = this.spaceAboveStaff;
            linePosY= newLine.position.y;
            lineGroup.add(newLine);
        }
        lineGroup.name = "Line Group";
        this.scaleRoot.add(lineGroup);
    }

    //////////////////////////////////////////////////////
    // Main Program Functions
    //////////////////////////////////////////////////////

    /**
     * Take a step in the animation
     * @param {float} dt Elapsed time since last step
     */
    step(dt) {
        if(!this.started){
            this.started = true;
            this.sampAud.startRecording();
        }
        //this.notePositionUpdateAnalyze();
        if(this.endTracking){
            this.endProgram();
        }
    }

    notePositionUpdateAnalyze(){
        //Takes world coordinates of ARGROUP and provides the inverse
        //Then applies the the inverse as a transformation of tsshe identity
        //Giving the current position of the camera, relative to the ARGROUP object


        //old code for current position
        let worldCoords = this.scaleRoot.matrixWorld;
        let inverseWorldCoords = worldCoords.getInverse(worldCoords);
        let transformVector = new THREE.Vector4(0,0,0,1);
        let newPosition = transformVector.applyMatrix4(inverseWorldCoords);
        //Applies new X and Z positions to the current position object based on tranformation above
        let X = Math.abs(this.ghostNote.position.x - newPosition.x);
        let Z = Math.abs(this.ghostNote.position.z - newPosition.z);
        if(X < this.moveThresh && Z < this.moveThresh){
            this.ghostNote.position.x = newPosition.x;
            this.ghostNote.position.z = newPosition.z - 2;
        }
        let thresh = 0.1;
        let currentPosition = this.ghostNote.position;
        //end of old current position code
    
    
        //Checks position of currentPosition relative to notes on staff
        //If at Z coordinate of note, the note audio(s) will play and color is changed
        let checkPos = 0;
        if(this.linesToUse[0]){
            checkPos = this.CFGroup.children[this.currentNoteInd].position.z;
        }else{
            checkPos = this.CPGroup.children[this.currentNoteInd].position.z;
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
    };

    //////////////////////////////////////////////////////
    // End Program Functions
    //////////////////////////////////////////////////////

    /**
     * Function stops the tracking processes and sets up program results
     */
    endProgram () {
        this.formatPositions();
        this.digAud.getNoteResults(this.formattedPositions);
        this.createEndScene();
        this.digAud.mp3UserNoteSetup();
        this.playUserChoice();
    }

    /**
     * Function to format the user positions tracked while traversing the scene
     * Will snap a position to either a line in the scene or the exact middle of two lines in the scene.
     */
    formatPositions() {
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
    createEndScene() {
        this.scaleRoot.remove(this.ghostNote);
        this.scaleRoot.rotateX(1.57);
        this.scaleRoot.rotateY(-1.57);
        this.scaleRoot.rotateZ(0.35);
        this.scaleRoot.position.x = -7;
        this.scaleRoot.position.y = 0;
        this.scaleRoot.position.z = -22.5;

        //createbackground
        let backG = new THREE.BoxGeometry(50,0.1,70);
        let backM = new THREE.MeshPhongMaterial({color:this.colors[this.noteColor]});
        let backGround = new THREE.Mesh(backG,backM);
        backGround.position.y = -10;
        this.scaleRoot.add(backGround);

        //add user positions
        let noteSpacing = 1.5;
        let notePositionY = 1;
        let resGroup = new THREE.Group();
        for(let i = 0; i < this.formattedPositions.length; i++){
            let newNote = this.makeNoteObject(this.ghostColor);
            newNote.position.x = this.formattedPositions[i];
            newNote.position.y = 1000;
            newNote.position.z = notePositionY - noteSpacing;
            notePositionY = newNote.position.z;
            resGroup.add(newNote);
        }
        this.scaleRoot.add(resGroup);
        this.resGroup = resGroup;
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Plays the music lines (counterpoint and/or cantus firmus, as well as the user position notes) simultaneously based on time
     * tracked in the traversal.
     */
    playUserChoice() {
        //this.sampAud.playAudio();
        for(let i = 0; i < this.globalTimes.length; i++){
            this.globalTimes[i] -= this.timeOffset;
        }
        for(let i = 0; i < this.globalTimes.length; i++){
            setTimeout(() => {
                this.resGroup.children[i].position.y = this.spaceAboveStaff;
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
    makeNoteObject(index) {
        let geo = new THREE.TorusGeometry(this.noteWidth/2, this.noteWidth/8, 10, 24);
        return new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:this.colors[index]}));
    };

    /**
     * @param {Int} index
     * 
     * Changes the color of the notes from black to gold when you pass them by while traversing the scene
     */
    changeNoteColor(index){
        if(this.linesToUse[0]){
            this.CFGroup.children[index].material= 
            new THREE.MeshPhongMaterial(this.colors[this.replaceColor]);
        }
        if(this.linesToUse[1]){
            this.CPGroup.children[index].material= 
            new THREE.MeshPhongMaterial(this.colors[this.replaceColor]);
        }
    }
}

export {CounterpointScene}