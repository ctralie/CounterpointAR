function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

class TestClass {
    constructor(fileName, useCF, useCP) {
        this.useCantusFirmus = useCF;
        this.useCounterpoint = useCP;
        this.notes= new RollReader();
        this.notes.loadFile(fileName);
        this.doSomethingWithFile();
        
    }

    doSomethingWithFile() {
        if (!this.notes.fileReady) {
            // "this" makes sure that when doSomethingWithData is called 
            // it actually is called on the current object
            this.notes.data.then(this.doSomethingWithFile.bind(this));
        }
        else {
            // Do some stuff now that it's ready
            //console.log("Lines after finished" + this.notes.lines);
            this.digAud = new DAGenerator();
            this.digAud.fillInfo(this.notes.parseInfo());
            this.scene = new BasicScene();
            this.scene.makeScene(this.notes.parseInfo());
            this.posAR = new PositionalAR(this.scene,this.digAud, this.useCantusFirmus, this.useCounterpoint);
            this.endCheck();
        }
    }

    //this.analyzeCollectedData();

    endCheck(){
        if(this.posAR.endProgram){
            this.analyzeCollectedData();
        }else{
            setTimeout(() => {
                this.endCheck();
            }, 1000)
        }
    }

    analyzeCollectedData(){
        let formattedPositions = [];
        for(let i = 0; i < this.posAR.trackedPositions.length; i++){
            let actual = this.posAR.trackedPositions[i];
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
        let NPL = Object.entries(this.posAR.SPL.possibilitiesDic);
        for(let i = 0; i < formattedPositions.length; i++){
            for(let j = 0; j < NPL.length; j++){
                if(formattedPositions[i] == NPL[j][1]*0.5){
                    noteResults.push(NPL[j][0]);
                    j = NPL.length;
                }
            }
        }
        let offset = this.posAR.timeOffset;
        for(let i = 0; i < this.posAR.globalTimes.length; i++){
            this.posAR.globalTimes[i] -= offset;
        }
        this.formattedPositions = formattedPositions;
        this.posAR.noteResults = noteResults;
        this.createEndScene();
        this.posAR.renderer.render(this.posAR.scene, this.posAR.camera);
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
        this.posAR.arGroup.setRotationFromQuaternion(this.posAR.OGQuat);
        this.posAR.arGroup.remove(this.posAR.ghostNote);
        this.posAR.arGroup.rotateX(1.57);
        this.posAR.arGroup.rotateY(-1.57);
        this.posAR.arGroup.rotateZ(0.35);
        this.posAR.arGroup.position.x = -7;
        this.posAR.arGroup.position.y = 0;
        this.posAR.arGroup.position.z = -22.5;

        //createbackground
        let backG = new THREE.BoxGeometry(50,0.1,70);
        let backM = new THREE.MeshStandardMaterial(this.posAR.colors[this.posAR.noteColor]);
        let backGround = new THREE.Mesh(backG,backM);
        backGround.position.y = -10;
        this.posAR.arGroup.add(backGround);

        //add user positions
        let noteSpacing = 1.5;
        let notePositionZ = 1;
        let resGroup = new THREE.Group();
        for(let i = 0; i < this.formattedPositions.length; i++){
            let newNote = this.posAR.makeNoteObject(this.posAR.ghostColor);
            newNote.position.x = this.formattedPositions[i];
            newNote.position.y = 1000;
            newNote.position.z = notePositionZ - noteSpacing;
            notePositionZ = newNote.position.z;
            resGroup.add(newNote);
        }
        this.posAR.arGroup.add(resGroup);
        this.posAR.NNGI = this.posAR.arGroup.children.length - 1;
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
        for(let i = 0; i < this.posAR.globalTimes.length; i++){
            setTimeout(() => {
                this.posAR.arGroup.children[this.posAR.NNGI].children[i].position.y = this.posAR.spaceAboveStaff;
                if(this.posAR.linesToUse[0]){
                    this.posAR.digAud.playCantFirmNote(i);
                }
                if(this.posAR.linesToUse[1]){
                    this.posAR.digAud.playCounterpointNote(i);
                }
                this.playUserNote(i);
                this.posAR.renderer.render(this.posAR.scene, this.posAR.camera);
            }, this.posAR.globalTimes[i])
        }
    }
}

let useCF = (getParameterByName("cf") === 'true');
let useCP = (getParameterByName("cp") === 'true');
let filename = getParameterByName("tune");

let obj = new TestClass(filename, useCF, useCP);