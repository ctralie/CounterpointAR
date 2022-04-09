class ScalePositionLists{
    constructor(inputList){
        let clef = inputList[1];
        let key = inputList[2];
        let firstCFNote = inputList[3];
        let firstCPNote = inputList[4];
        let cf = inputList[5];
        let cp = inputList[6];

        //starts at C flat 4
        this.trebleXPositions = {
            "Cf4":6,"C4":6,"Cs4":6,"Df4":5,"D4":5,"Ds4":5,"Ef4":4,"E4":4,"Es4":4,"Ff4":3,"F4":3,
            "Fs4":3,"Gf4":2,"G4":2,"Gs4":2,"Af4":1,"A4":1,"As4":1,"Bf4":0,"B4":0,"Bs4":0,"Cf5":-1,
            "C5":-1,"Cs5":-1,"Df5":-2,"D5":-2,"Ds5":-2,"Ef5":-3,"E5":-3,"Es5":-3,"Ff5":-4,"F5":-4,
            "Fs5":-4,"Gf5":-5,"G5":-5,"Gs5":-5,"Af5":-6,"A5":-6,"As5":-6
        };

        //starts at D flat 3
        this.altoXPositions = [3.5,3.5,3,3,2.5,2,2,1.5,1.5,
            1,1,.5,0,0,-.5,-.5,1,-1.5,-1.5,-2,-2,-2.5];

        //starts at E flat 2
        this.bassXPositions = [3,3,2.5,2.5,2,1.5,1.5,1,1,.5,
            .5,0,-.5,-.5,-1,-1,-1.5,-2,-2,-2.5,-2.5,-3];

        //All possible notes in this program
        this.mainList = ["Ef2","E2","Es2","Ff2","F2","Fs2","Gf2","G2","Gs2","Af2","A2","As2",
            "Bf2","B2","Bs2","Cf3","C3","Cs3","Df3","D3","Ds3","Ef3","E3","Es3","Ff3","F3","Fs3",
            "Gf3","G3","Gs3","Af3","A3","As3","Bf3","B3","Bs3","Cf4","C4","Cs4","Df4","D4","Ds4",
            "Ef4","E4","Es4","Ff4","F4","Fs4","Gf4","G4","Gs4","Af4","A4","As4","Bf4","B4","Bs4",
            "Cf5","C5","Cs5","Df5","D5","Ds5","Ef5","E5","Es5","Ff5","F5","Fs5","Gf5","G5","Gs5",
            "Af5","A5","As5"];

        this.mainKeyIndicies = {
            "C-Natural-Major":[1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,49,52,55,58,61,64,67,70,73],
            "A-Natural-Minor":[1,4,7,10,13,16,19,22,25,28,31,34,37,40,43,46,49,52,55,58,61,64,67,70,73],
            "G-Natural-Major":[1,5,7,10,13,16,19,22,26,28,31,34,37,40,43,47,49,52,55,58,61,64,68,70,73],
            "E-Natural-Minor":[1,5,7,10,13,16,19,22,26,28,31,34,37,40,43,47,49,52,55,58,61,64,68,70,73],
            "D-Natural-Major":[1,5,7,10,13,17,19,22,26,28,31,34,38,40,43,47,49,52,55,59,61,64,68,70,73],
            "B-Natural-Minor":[1,5,7,10,13,17,19,22,26,28,31,34,38,40,43,47,49,52,55,59,61,64,68,70,73],
            "A-Natural-Major":[1,5,8,10,13,17,19,22,26,29,31,34,38,40,43,47,50,52,55,59,61,64,68,71,73],
            "F-Sharp-Minor":[1,5,8,10,13,17,19,22,26,29,31,34,38,40,43,47,50,52,55,59,61,64,68,71,73],
            "E-Natural-Major":[1,5,8,10,13,17,20,22,26,29,31,34,38,41,43,47,50,52,55,59,62,64,68,71,73],
            "C-Sharp-Minor":[1,5,8,10,13,17,20,22,26,29,31,34,38,41,43,47,50,52,55,59,62,64,68,71,73],
            "B-Natural-Major":[1,5,8,11,13,17,20,22,26,29,32,34,38,41,43,47,50,53,55,59,62,64,68,71,74],
            "G-Sharp-Minor":[1,5,8,11,13,17,20,22,26,29,32,34,38,41,43,47,50,53,55,59,62,64,68,71,74],
            "F-Sharp-Major":[2,5,8,11,13,17,20,23,26,29,32,34,38,41,44,47,50,53,55,59,62,65,68,71,74],
            "D-Sharp-Minor":[2,5,8,11,13,17,20,23,26,29,32,34,38,41,44,47,50,53,55,59,62,65,68,71,74],
            "C-Sharp-Major":[2,5,8,11,14,17,20,23,26,29,32,35,38,41,44,47,50,53,56,59,62,65,68,71,74],
            "A-Sharp-Minor":[2,5,8,11,14,17,20,23,26,29,32,35,38,41,44,47,50,53,56,59,62,65,68,71,74],
            "F-Natural-Major":[1,4,7,10,12,16,19,22,25,28,31,33,37,40,43,46,49,52,54,58,61,64,67,70,73],
            "D-Natural-Minor":[1,4,7,10,12,16,19,22,25,28,31,33,37,40,43,46,49,52,54,58,61,64,67,70,73],
            "B-Flat-Major":[0,4,7,10,12,16,19,21,25,28,31,33,37,40,42,46,49,52,54,58,61,63,67,70,73],
            "G-Natural-Minor":[0,4,7,10,12,16,19,21,25,28,31,33,37,40,42,46,49,52,54,58,61,63,67,70,73],
            "E-Flat-Major":[0,4,7,9,12,16,19,21,25,28,30,33,37,40,42,46,49,51,54,58,61,63,67,70,72],
            "C-Natural-Minor":[0,4,7,9,12,16,19,21,25,28,30,33,37,40,42,46,49,51,54,58,61,63,67,70,72],
            "A-Flat-Major":[0,4,7,9,12,16,18,21,25,28,30,33,37,39,42,46,49,51,54,58,60,63,67,70,72],
            "F-Natural-Minor":[0,4,7,9,12,16,18,21,25,28,30,33,37,39,42,46,49,51,54,58,60,63,67,70,72],
            "D-Flat-Major":[0,4,6,9,12,16,18,21,25,27,30,33,37,39,42,46,48,51,54,58,60,63,67,69,72],
            "B-Flat-Minor":[0,4,6,9,12,16,18,21,25,27,30,33,37,39,42,46,48,51,54,58,60,63,67,69,72],
            "G-Flat-Major":[0,4,6,9,12,15,18,21,25,27,30,33,36,39,42,46,48,51,54,57,60,63,67,69,72],
            "E-Flat-Minor":[0,4,6,9,12,15,18,21,25,27,30,33,36,39,42,46,48,51,54,57,60,63,67,69,72],
            "C-Flat-Major":[0,3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60,63,66,69,72],
            "A-Flat-Minor":[0,3,6,9,12,15,18,21,24,27,30,33,36,39,42,45,48,51,54,57,60,63,66,69,72],
        };

        this.posArr = {};
        switch(clef){
            case "Bass":
                this.posArr = this.bassXPositions;
                break;
            case "Alto":
                this.posArr = this.altoXPositions; 
                break;
            case "Treble":
                this.posArr = this.trebleXPositions;
                break;
        }
        let noteIndicies = this.mainKeyIndicies[key];
        this.keyList = [];
        for(let i = 0; i < noteIndicies.length; i++){
            this.keyList.push(this.mainList[noteIndicies[i]]);
        }
        this.possibilitiesDic = {};
        let dicIndexer = Object.entries(this.posArr);
        let ind = 0;
        for(let i = 0; i < this.keyList.length; i++){
            for(let j = ind; j < dicIndexer.length; j++){
                if(this.keyList[i] == dicIndexer[j][0]){
                    this.possibilitiesDic[dicIndexer[j][0]] = dicIndexer[j][1]; 
                    ind = j;
                    j = dicIndexer.length;
                }
            }
        }

        let fCFInd = this.keyList.indexOf(firstCFNote);
        let fCPInd = this.keyList.indexOf(firstCPNote);
        this.cfMaster = {};
        this.cpMaster = {};

        /**
         *  cfMaster["some val"] = some val
         * 
         * dict = {0:{note:"",pos:3}}
         */

        //cf[degrees,durs,accs]
        for(let i = 0; i < cf[0].length; i++){
            //get x pos and note string for cantus firmus
            let degInd = fCFInd + cf[0][i] - 1;
            let fNote = this.keyList[degInd];
            let fPos = this.posArr[fNote];
            let fLength = cf[1][i];
            let curAcc = cf[2][i];
            if(curAcc != "Nothing"){
                if(curAcc == "Diminished"){
                    let tempNote = this.keyList[degInd];
                    let tempInd = this.mainList.indexOf(tempNote) - 1;
                    fNote = this.mainList[tempInd];
                }else{
                    let tempNote = this.keyList[degInd];
                    let tempInd = this.mainList.indexOf(tempNote) + 1;
                    fNote = this.mainList[tempInd];
                }
            }
            //get x pos and note string for counterpoint
            degInd = fCFInd + cp[0][i] - 1;
            let pNote = this.keyList[degInd];
            let pPos = this.posArr[pNote];
            let pLength = cp[1][i];
            curAcc = cp[2][i];
            if(curAcc != "Nothing"){
                if(curAcc == "Diminished"){
                    let tempNote = this.keyList[degInd];
                    let tempInd = this.mainList.indexOf(tempNote) - 1;
                    pNote = this.mainList[tempInd];
                }else{
                    let tempNote = this.keyList[degInd];
                    let tempInd = this.mainList.indexOf(tempNote) + 1;
                    pNote = this.mainList[tempInd];
                }
            }
            //add to dictionaries
            let fEntry = {};
            fEntry.note = fNote;
            fEntry.pos = fPos;
            fEntry.len = fLength;
            this.cfMaster[i] = fEntry;
            let pEntry = {};
            pEntry.note = pNote;
            pEntry.pos = pPos;
            pEntry.len = pLength;
            this.cpMaster[i] = pEntry;
        }
        this.songLength = Object.keys(this.cfMaster).length;
    }
}