const MP3_DICTIONARY_TREBLE = [
    {"C4":"notes/C4.mp3","C#4":"notes/C#4.mp3","D4":"notes/D4.mp3","D#4":"notes/D#4.mp3",
    "E4":"notes/E4.mp3","F4":"notes/F4.mp3","F#4":"notes/F#4.mp3","G4":"notes/G4.mp3",
    "G#4":"notes/G#4.mp3","A4":"notes/A4.mp3","A#4":"notes/A#4.mp3","B4":"notes/B4.mp3",
    "C5":"notes/C5.mp3","C#5":"notes/C#5.mp3","D5":"notes/D5.mp3","D#5":"notes/D#5.mp3",
    "E5":"notes/E5.mp3","F5":"notes/F5.mp3","F#5":"notes/F#5.mp3","G5":"notes/G5.mp3",
    "G#5":"notes/G#5.mp3","A5":"notes/A5.mp3"}
];

const MP3_DICTIONARY_ALTO = [];

const MP3_DICTIONARY_BASS= [];

class DAGenerator{

    constructor(){
        
        this.noteArray = [];
        this.audioArrays = [];
        this.noteCount = 0;
        this.mp3Notes = [];
        this.mp3Arrays = [];
        this.noteDic = ["C1","C#1","D1",
        "D#1","E1","F1","F#1","G1","G#1",
        "A1","A#1","B1","C2","C#2","D2",
        "D#2","E2","F2","F#2","G2","G#2","A2"];

    }

    setupSampleAudio(){
        for(let i = 0; i < this.mp3Notes.length; i++){
            let str = this.mp3Notes[i];
            let pDir = "notes/"+str+".mp3";
            let sampAud = new Audio(pDir);
            this.mp3Arrays.push(sampAud);
        }
    }

    playNoteTone(noteNumber){
        this.mp3Arrays[noteNumber].play();
    }

    createAudioArrays(){
        for(let i = 0; i < this.noteCount; i++){
            this.audioArrays.push(new SampledAudio());
        }
        let sortedNoteArray = this.noteArray.sort(function(a,b){return a - b});
        let freqVarianceList = [];
        for(let i = 0; i < sortedNoteArray.length; i++){
            if(!freqVarianceList.includes(sortedNoteArray[i])){
                freqVarianceList.push(sortedNoteArray[i]);
            }
        }
        //make 1 audio array per each different note (not all notes)
        let waveformArrays = [];
        for(let i = 0; i < freqVarianceList.length; i++){
            let waveForm = new Float32Array(this.sr*this.noteLength);
            let nV = freqVarianceList[i];
            for(let j = 0; j < waveForm.length; j++){
                waveForm[j] += Math.cos(2*Math.PI*this.freq*nV/this.sr);
                console.log(i);
            }
            waveformArrays.push(waveForm);
        }
        console.log(waveformArrays);
    }

    inputSongChoice(){
        switch(this.songnumber){
            case(0):
                this.extractNoteInformation(SONG_ZERO);
                break;
            case(1):
                this.extractNoteInformation(SONG_ONE);
                break;
            case(2):
                this.extractNoteInformation(SONG_TWO);
                break;
            case(3):
                this.extractNoteInformation(SONG_THREE);
                break;
            case(4):
                this.extractNoteInformation(FREE_SONG);
            default:
                //you done goofed
                break;
        }
    }

    extractNoteInformation(songChoice){
        this.noteCount = songChoice.length;
        for(let i = 0; i < this.noteCount; i++){
            this.noteArray.push(-1);
            this.mp3Notes.push(songChoice[i].note);
        }
        let breakCount = 0;
        for(let i = 0; i < this.noteDic.length; i++){
            if(breakCount != this.noteCount){
                for(let j = 0; j < this.noteCount; j++){
                    if(this.mp3Notes[j] == this.noteDic[i]){
                        this.noteArray[j] = i-9;
                        breakCount++;
                    }
                }
            }
        }
    }

}


//READ FILE INPUT AND CONVERT NOTE AND SCALE DEGREES TO ARRAYS
class MusicReader{

    constructor(){
        
    }
}