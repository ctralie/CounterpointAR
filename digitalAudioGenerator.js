



class DAGenerator{

    
    constructor(){
        
        const that = this;
        this.ret = [];
        this.loadedStuff = false;
        this.clef = "";
        this.usedArr = null;
        this.cantusFirmusNotes = [];
        this.cantusFirmusDurs = [];
        this.counterpointNotes = [];
        this.counterpointDurs = [];
        this.cfMp3Arrs = [];
        this.cpMp3Arrs = [];

        //add flats
        this.bassNoteArr = ["D#2","E2","E#2","F2",
        "F#2","G2","G#2","A2","A#2","B2","B#2",
        "C3","C#3","D3","D#3","E3","E#3","F3",
        "F#3","G3","G#3","A3","A#3","B3","B#3"];

        //add flats
        this.altoNoteArr = ["C#3","D3","D#3","E3","E#3","F3",
        "F#3","G3","G#3","A3","A#3","B3","B#3","C4","C#4","D4","D#4","E4","E#4","F4",
        "F#4","G4","G#4","A4","A#4","B4","B#4"];

        this.trebleNoteArr = ["B#3","Cf4","C4","C#4","Df4","D4","D#4","Ef4",
        "E4","E#4","Ff4","F4","F#4","Gf4","G4","G#4","Af4","A4","A#4","Bf4",
        "B4","B#4","Cf5","C5","C#5","Df5","D5","D#5","Ef5","E5","E#5","Ff5",
        "F5","F#5","Gf5","G5","G#5","Af5","A5","A#5"];

    }

    /**
     * Fills in info for the Audio Generator to create audio with.
     * ret  Array
     * ret[0] = Time Signature (String)
     * ret[1] = Clef (String)
     * ret[2] = Alteration (sharp/natural/flat) (String)
     * ret[3][0] = CantusFirmus Notes (String[])
     * ret[3][1] = CantusFirmus Durations (Int[])
     * ret[4][0] = Counterpoint Notes (String[])
     * ret[4][1] = Counterpoint Durations (Int[])
     */
    fillInfo(ret){
        this.clef = ret[1];
        this.cantusFirmusNotes = ret[3][0];
        this.cantusFirmusDurs = ret[3][1];
        this.cfLength = this.cantusFirmusNotes.length;
        this.counterpointNotes = ret[4][0];
        this.counterpointDurs = ret[4][1];
        this.cpLength = this.counterpointNotes.length
        switch(this.clef){
            case "Bass":
                this.usedArr = this.bassNoteArr;
                break;
            case "Alto":
                this.usedArr = this.altoNoteArr;
                break;
            case "Treble":
                this.usedArr = this.trebleNoteArr;
        }
        console.log(ret);
        this.mp3CantusFirmusSetup();
        this.mp3CounterpointSetup();
    }

    /**
     * Loads Cantusfirmus audio files to be used
     */
    mp3CantusFirmusSetup(){
        for(let i = 0; i < this.cfLength; i++){
            let note = this.cantusFirmusNotes[i];
            let dur = this.cantusFirmusDurs[i];
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
        for(let i = 0; i < this.cpLength; i++){
            let note = this.counterpointNotes[i];
            let dur = this.counterpointDurs[i];
            let pDir = "notes/"+dur+"/"+note+".mp3";
            let sampAud = new Audio(pDir);
            this.cpMp3Arrs.push(sampAud);
        }
    }

    /**
     * Plays specific note index of cantus firmus audio WHEN the promise of loaded audio arrays is fulfilled
     * noteNumber   Int
     */
    playCantFirmNote(noteNumber){
        if(this.cfMp3Arrs[noteNumber].readyState >= 2){
            this.cfMp3Arrs[noteNumber].play();
            console.log("played note");
        }else{
            this.cfMp3Arrs[noteNumber].addEventListener('loadeddata', function(){
                that.cfMp3Arrs[noteNumber].play();
                console.log("played note");
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
            console.log("played note");
        }else{
            this.cpMp3Arrs[noteNumber].addEventListener('loadeddata', function(){
                that.cpMp3Arrs[noteNumber].play();
                console.log("played note");
            });
        }
    }
}