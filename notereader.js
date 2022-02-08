class NoteReader {

    constructor() {
        this.fileReady = false;
        this.data = null; // Reference to promise
        this.lines = [];
        this.timeSig = [];
        this.clef = "";
        this.cantusFirmusNotes = [];
        this.counterpointNotes = [];
    }

    loadFile(filename) {
        let that = this;
        this.fileReady = false;
        this.lines = [];
        this.data = new Promise(
            function(resolve, reject) {
                $.get(filename, function(s) {
                    let lines = s.split("\n");
                    for (let i = 0; i < lines.length; i++) {
                        if ((lines[i][0] != "@") && (lines[i] != "")) {
                            that.lines.push(lines[i]);
                        }
                    }
                    that.fileReady = true;
                    resolve();
                }, "text")
                .fail(() => {
                    reject();
                });
            }
        );
        return this.data;
    }

    /*
    Time signature: (2,2)
    Clef: (Treble)
    Cantus Firmus:
    d : 2
    ...
    Counterpoint:
    d : 2
    ...
    */
    parseInfo(){
        console.log(this.lines)
        let timeSigIndex = 0;
        let clefIndex = 1;
        let cantFirmIndex = 3;
        let cPointIndex = 0;
        for(let i = 0; i < this.lines.length; i++){
            if(this.lines[i].includes("Counterpoint:")){
                cPointIndex = i+1;
                i = this.lines.length;
            }
        }
        let indArr = [timeSigIndex,clefIndex];
        for(let i = 0; i < indArr.length; i++){
            let index = this.lines[indArr[i]].indexOf(":");
            let info = this.lines[indArr[i]].substring(index);
            if(i == 0){
                //time sig
                info = info.substring(info.indexOf("(")+1);
                this.timeSig.push(parseInt(info.substring(0,1)));
                this.timeSig.push(parseInt(info.substring(2,3)));
                console.log(this.timeSig);
            }else{
                //clef
                this.clef = info.substring(info.indexOf("(")+1,info.indexOf(")"));
                console.log(this.clef);
            }
        }
        //cantus firmus

        //counterpoint
        
    }
}