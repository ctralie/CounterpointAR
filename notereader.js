class RollReader {

    constructor() {
        this.fileReady = false;
        this.data = null; // Reference to promise
        this.lines = [];
        this.timeSig = [];
        this.clef = "";
        this.alteration = "";
        this.cantusFirmusNotes = [];
        this.cantusFirmusDurs = [];
        this.counterpointNotes = [];
        this.counterpointDurs = [];
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
                            that.lines.push(lines[i].replace(/\s/g,''));
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
    Alteration: (Sharp)
    Cantus Firmus:
    D#4 : quarter
    ...
    Counterpoint:
    Df4 : quarter
    ...
    */

    //returns parsed info
    parseInfo(){
        let timeSigIndex = 0;
        let clefIndex = 1;
        let alterationIndex = 2;
        let cantFirmIndex = 4;
        let cPointIndex = 0;
        
        let indArr = [timeSigIndex,clefIndex, alterationIndex];
        for(let i = 0; i < indArr.length; i++){
            let index = this.lines[indArr[i]].indexOf(":");
            let info = this.lines[indArr[i]].substring(index);
            if(i == 0){
                //time sig
                info = info.substring(info.indexOf("(")+1);
                this.timeSig.push(parseInt(info.substring(0,1)));
                this.timeSig.push(parseInt(info.substring(2,3)));
            }else if(i == 1){
                //clef
                this.clef = info.substring(info.indexOf("(")+1,info.indexOf(")"));
            }else{
                //alteration
                this.alteration = info.substring(info.indexOf("(")+1,info.indexOf(")"));
            }
        }
        for(let i = 0; i < this.lines.length; i++){
            if(this.lines[i].includes("Counterpoint:")){
                cPointIndex = i;
                i = this.lines.length;
            }
        }
        //cantus firmus and counter point
        for(let i = cantFirmIndex; i < this.lines.length; i++){
            let ind = this.lines[i].indexOf(":");
            if(i < cPointIndex){
                this.cantusFirmusNotes.push(this.lines[i].substring(0,ind));
                this.cantusFirmusDurs.push(this.lines[i].substring(ind+1));
            }
            if(i > cPointIndex){
                this.counterpointNotes.push(this.lines[i].substring(0,ind));
                this.counterpointDurs.push(this.lines[i].substring(ind+1));
            }
        }
        let CF = [this.cantusFirmusNotes,this.cantusFirmusDurs];
        let CP = [this.counterpointNotes,this.counterpointDurs];
        return [this.timeSig,this.clef,this.alteration,CF,CP];
    }

    
}