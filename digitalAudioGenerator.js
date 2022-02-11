



class DAGenerator{

    //ret[0] = time sig
    //ret[1] = clef
    //ret[2] = alteration
    //ret[3] = cantus firmus [notes, durations]
    //ret[4] = counterpoint [notes, durations]
    constructor(){

        this.ret = [];

        this.clef = "";
        this.usedArr = null;
        this.cantusFirmusNotes = [];
        this.cantusFirmusDurs = [];
        this.counterpointNotes = [];
        this.counterpointDurs = [];
        this.cfMp3Arrs = [];
        this.cpMp3Arrs = [];

        this.bassNoteArr = ["D#2","E2","E#2","F2",
        "F#2","G2","G#2","A2","A#2","B2","B#2",
        "C3","C#3","D3","D#3","E3","E#3","F3",
        "F#3","G3","G#3","A3","A#3","B3","B#3"];

        this.altoNoteArr = ["C#3","D3","D#3","E3","E#3","F3",
        "F#3","G3","G#3","A3","A#3","B3","B#3","C4","C#4","D4","D#4","E4","E#4","F4",
        "F#4","G4","G#4","A4","A#4","B4","B#4"];

        this.trebleNoteArr = ["B#3","C4","C#4","D4","D#4","E4","E#4","F4",
        "F#4","G4","G#4","A4","A#4","B4","B#4","C5","C#5","D5","D#5","E5","E#5","F5",
        "F#5","G5","G#5","A5","A#5"];

    }

    fillInfo(ret){
        console.log(ret);
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


        this.mp3CantusFirmusSetup();
    }

    /*
        directory path:
        notes/(note)/duration/____.mp3
    */

    mp3CantusFirmusSetup(){
        for(let i = 0; i < this.cfLength; i++){
            let note = this.cantusFirmusNotes[i];
            if(note.includes("f")){
                note = this.changeFlatNotes(note);
            }
            let dur = this.cantusFirmusDurs[i];
            let pDir = "notes/"+note+"/"+dur+".mp3";
            console.log(pDir);
            //let sampAud = new Audio(pDir);
            //this.mp3Arrays.push(sampAud);
            
            
        }
    }

    changeFlatNotes(note){
        let str = note.substring(0,1) + note.substring(2);
        return this.usedArr[this.usedArr.indexOf(str) - 1]
    }

    playNoteTone(noteNumber){
        this.mp3Arrays[noteNumber].play();
    }
}