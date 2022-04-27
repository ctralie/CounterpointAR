class RollReader {
    /**
     * @constructor
     * 
     */
    constructor() {
        this.fileReady = false;
        this.data = null; // Reference to promise
        this.lines = [];
        this.timeSig = [];
        this.clef = "";
        this.key = "";
        this.firstCFNote = "";
        this.firstCPNote = "";
        this.cantusFirmusDegrees = [];
        this.cantusFirmusDurs = [];
        this.cantusFirmusAccs = [];
        this.counterpointDegrees = [];
        this.counterpointDurs = [];
        this.counterpointAccs = [];
    }
    loadFile(filename) {
        console.log(filename);
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
    Key: C-Natural-Major
    First Scale Degree: D4
    Cantus Firmus:
    1 : half
    ...
    Counterpoint:
    1 : half : Augmented
    ...
    */

    //returns parsed info
    parseInfo(){
        let timeSigIndex = 0;
        let clefIndex = 1;
        let keyIndex = 2;
        let firstCFNoteInd = 3;
        let firstCPNoteInd = 4;
        let cantFirmIndex = 6;
        let cPointIndex = 0;
        let indArr = [timeSigIndex,clefIndex,keyIndex,firstCFNoteInd,firstCPNoteInd];
        for(let i = 0; i < indArr.length; i++){
            let index = this.lines[indArr[i]].indexOf(":");
            let info = this.lines[indArr[i]].substring(index);
            switch(i){
                case 0:
                    info = info.substring(info.indexOf("(")+1);
                    this.timeSig.push(parseInt(info.substring(0,1)));
                    this.timeSig.push(parseInt(info.substring(2,3)));
                    break;
                case 1:
                    this.clef = info.substring(info.indexOf("(")+1,info.indexOf(")"));
                    break;
                case 2:
                    this.key = info.substring(1);
                    break;
                case 3:
                    this.firstCFNote = info.substring(1);
                    break;
                case 4:
                    this.firstCPNote = info.substring(1);
                    break;
            }

        }
        for(let i = cantFirmIndex; i < this.lines.length; i++){
            if(this.lines[i].includes("Counterpoint:")){
                cPointIndex = i;
                i = this.lines.length;
            }
        }
        //cantus firmus and counter point
        for(let i = cantFirmIndex; i < this.lines.length; i++){
            let ind = this.lines[i].indexOf(":");
            if(i < cPointIndex){
                let ladderSub = this.lines[i].substring(ind+1);
                this.cantusFirmusDegrees.push(parseInt(this.lines[i].substring(0,ind)));
                if(ladderSub.includes(":")){
                    let newInd = ladderSub.indexOf(":");
                    this.cantusFirmusDurs.push(ladderSub.subtring(0,newInd));
                    this.cantusFirmusAccs.push(ladderSub.substring(newInd+1));
                }else{
                    this.cantusFirmusDurs.push(this.lines[i].substring(ind+1));
                    this.cantusFirmusAccs.push("Nothing");
                }
            }
            if(i > cPointIndex){
                let ladderSub = this.lines[i].substring(ind+1);
                this.counterpointDegrees.push(parseInt(this.lines[i].substring(0,ind)));
                if(ladderSub.includes(":")){
                    let newInd = ladderSub.indexOf(":");
                    this.counterpointDurs.push(ladderSub.substring(0,newInd));
                    this.counterpointAccs.push(ladderSub.substring(newInd+1));
                }else{
                    this.counterpointDurs.push(this.lines[i].substring(ind+1));
                    this.counterpointAccs.push("Nothing");
                }
            }
        }
        let CF = [this.cantusFirmusDegrees,this.cantusFirmusDurs,this.cantusFirmusAccs];
        let CP = [this.counterpointDegrees,this.counterpointDurs,this.counterpointAccs];
        return [this.timeSig,this.clef,this.key,this.firstCFNote,this.firstCPNote,CF,CP];
    }
}