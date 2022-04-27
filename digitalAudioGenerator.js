class DAGenerator{

    /**
     * @constructor
     * Initializes global variables 
     */
    constructor(SPL){
        const that = this;
        this.ret = [];
        this.loadedStuff = false;
        this.gotUserMP3 = false;
        this.noteResults = [];
        this.cfMp3Arrs = [];
        this.cpMp3Arrs = [];
        this.userMp3Arrs = [];

        this.SPL = SPL;
        this.songLength = this.SPL.songLength;
        this.mp3CantusFirmusSetup();
        this.mp3CounterpointSetup();
    }

    /**
     * @param {Float[]} formattedPositions
     */
    getNoteResults(formattedPositions){
        this.noteResults = [];
        let NPL = Object.entries(this.SPL.possibilitiesDic);
        for(let i = 0; i < formattedPositions.length; i++){
            for(let j = 0; j < NPL.length; j++){
                if(formattedPositions[i] == NPL[j][1]*0.5){
                    this.noteResults.push(NPL[j][0]);
                    j = NPL.length;
                }
            }
        }
    }

    /**
     * Loads Cantusfirmus audio files to be used
     */
    mp3CantusFirmusSetup(){
        this.loadedStuff = false;
        for(let i = 0; i < this.songLength; i++){
            let note = this.SPL.cfMaster[i].note;
            let dur = this.SPL.cfMaster[i].len;
            let pDir = "notes/"+dur+"/"+note+".mp3";
            let sampAud = new Audio(pDir);
            this.cfMp3Arrs.push(sampAud);
        }
        this.loadedStuff = true;
    }

    /**
     * Loads Counterpoint audio files to be used
     */
    mp3CounterpointSetup(){
        this.loadedStuff = false;
        for(let i = 0; i < this.songLength; i++){
            let note = this.SPL.cpMaster[i].note;
            let dur = this.SPL.cpMaster[i].len;
            let pDir = "notes/"+dur+"/"+note+".mp3";
            let sampAud = new Audio(pDir);
            this.cpMp3Arrs.push(sampAud);
        }
        this.loadedStuff = true;
    }

    /**
     * 
     */
    mp3UserNoteSetup(){
        for(let i = 0; i < this.songLength; i++){
            let note = this.noteResults[i];
            let pDir = "notes/half/"+note+".mp3";
            let sampAud = new Audio(pDir);
            this.userMp3Arrs.push(sampAud);
        }
        this.gotUserMp3 = true;
    }

    /**
     * Plays specific note index of cantus firmus audio WHEN the promise of loaded audio arrays is fulfilled
     * noteNumber   Int
     */
    playCantFirmNote(noteNumber){
        if(this.cfMp3Arrs[noteNumber].readyState >= 2){
            this.cfMp3Arrs[noteNumber].play();
            //console.log("played note");
        }else{
            this.cfMp3Arrs[noteNumber].addEventListener('loadeddata', function(){
                that.cfMp3Arrs[noteNumber].play();
                //console.log("played note");
            });
        }
    }

    /**
     * Plays specific note index of Counterpoint audio WHEN the promise of loaded audio arrays is fulfilled
     * noteNumber   Int
     */
    playCounterpointNote(noteNumber){

        if(this.cpMp3Arrs[noteNumber].readyState >= 2){
            this.cpMp3Arrs[noteNumber].play();
            //console.log("played note");
        }else{
            this.cpMp3Arrs[noteNumber].addEventListener('loadeddata', function(){
                that.cpMp3Arrs[noteNumber].play();
                //console.log("played note");
            });
        }
    }

    /**
     * @param {Int} noteNumber
     */
    playUserNote(noteNumber){
        if(this.userMp3Arrs[noteNumber].readyState >= 2){
            this.userMp3Arrs[noteNumber].play();
            //console.log("played note");
        }else{
            this.userMp3Arrs[noteNumber].addEventListener('loadeddata', function(){
                that.userMp3Arrs[noteNumber].play();
                //console.log("played note");
            });
        }
    }
}