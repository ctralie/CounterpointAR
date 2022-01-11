
const SONG_ZERO = [
    {"note":"D1","degree": 1},{"note":"F1","degree": 3},
    {"note":"E1","degree": 2},{"note":"D1","degree": 1},
    {"note":"G1","degree": 4},{"note":"F1","degree": 3},
    {"note":"A1","degree": 5},{"note":"G1","degree": 4},
    {"note":"F1","degree": 3},{"note":"E1","degree": 2},
    {"note":"D1","degree": 1}
]; 

const SONG_ONE = [
    {"note":"A1","degree": 1},{"note":"C1","degree": 3},
    {"note":"B1","degree": 2},{"note":"C1","degree": 3},
    {"note":"E1","degree": 5},{"note":"F1","degree": 6},
    {"note":"E1","degree": 5},{"note":"D1","degree": 4},
    {"note":"C1","degree": 3},{"note":"B1","degree": 2},
    {"note":"A1","degree": 1}
];

const SONG_TWO = [
    {"note":"C1","degree": 1},{"note":"E1","degree": 3},
    {"note":"F1","degree": 4},{"note":"G1","degree": 5},
    {"note":"E1","degree": 3},{"note":"A1","degree": 6},
    {"note":"G1","degree": 5},{"note":"E1","degree": 3},
    {"note":"F1","degree": 4},{"note":"E1","degree": 3},
    {"note":"D1","degree": 2},{"note":"C1","degree": 1}
]; 

const SONG_THREE = [
    {"note":"F1","degree": 1},{"note":"G1","degree": 2},
    {"note":"A1","degree": 3},{"note":"F1","degree": 1},
    {"note":"D1","degree": 6},{"note":"E1","degree": 7},
    {"note":"F1","degree": 1},{"note":"C1","degree": 5},
    {"note":"A1","degree": 3},{"note":"F1","degree": 1},
    {"note":"G1","degree": 2},{"note":"F1","degree": 1}
]; 

const MP3_DICTIONARY = [
    {"C1":"notes/C1.mp3","C#1":"notes/C#1.mp3","D1":"notes/D1.mp3","D#1":"notes/D#1.mp3",
    "E1":"notes/E1.mp3","F1":"notes/F1.mp3","F#1":"notes/F#1.mp3","G1":"notes/G1.mp3",
    "G#1":"notes/G#1.mp3","A1":"notes/A1.mp3","A#1":"notes/A#1.mp3","B1":"notes/B1.mp3",
    "C2":"notes/C2.mp3","C#2":"notes/C#2.mp3","D2":"notes/D2.mp3","D#2":"notes/D#2.mp3",
    "E2":"notes/E2.mp3","F2":"notes/F2.mp3","F#2":"notes/F#2.mp3","G2":"notes/G2.mp3",
    "G#2":"notes/G#2.mp3","A2":"notes/A2.mp3"}
];




class DAGenerator{

    constructor(songNumber, isSampleAudio){
        
        this.sr = 44100; //sample rate
        this.baseFreq = 440; //starting frequency for calculating neighboring notes
        this.noteLength = 1; //seconds per note
        this.noteArray = [];
        this.audioArrays = [];
        this.noteCount = 0;
        this.songnumber = songNumber;
        this.mp3Notes = [];
        this.mp3Arrays = [];
        this.noteDic = ["C1","C#1","D1",
        "D#1","E1","F1","F#1","G1","G#1",
        "A1","A#1","B1","C2","C#2","D2",
        "D#2","E2","F2","F#2","G2","G#2","A2"];


        this.inputSongChoice();
        if(isSampleAudio){
            this.setupSampleAudio();
        }else{
            this.createAudioArrays();
        }
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