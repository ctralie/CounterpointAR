class ScalePositionLists{

    /**
     * @param {Object[]} inputList
     * Fills in info for the Audio Generator to create audio with.
     * ret  Array
     * ret[0] = Time Signature (Int[])
     * ret[1] = Clef (String)
     * ret[2] = Key (String)
     * ret[3] = First Cantus Firmus Note (String)
     * ret[4] = First Counterpoint Note (String)
     * ret[5][0] = CantusFirmus Degrees (Int[])
     * ret[5][1] = CantusFirmus Durations (String[])
     * ret[5][2] = CantusFirmus Accidentals (String[])
     * ret[6][0] = Counterpoint Degrees (Int[])
     * ret[6][1] = Counterpoint Durations (String[])
     * ret[6][2] = Counterpoint Accidentals (String[])
     */

    constructor(inputList){
        let clef = inputList[1];
        let key = inputList[2];
        let firstCFNote = inputList[3];
        let firstCPNote = inputList[4];
        let cf = inputList[5];
        let cp = inputList[6];

        this.trebleXPositions = {
            "Cf4":6,"C4":6,"Cs4":6,"Df4":5,"D4":5,"Ds4":5,"Ef4":4,"E4":4,"Es4":4,"Ff4":3,"F4":3,
            "Fs4":3,"Gf4":2,"G4":2,"Gs4":2,"Af4":1,"A4":1,"As4":1,"Bf4":0,"B4":0,"Bs4":0,"Cf5":-1,
            "C5":-1,"Cs5":-1,"Df5":-2,"D5":-2,"Ds5":-2,"Ef5":-3,"E5":-3,"Es5":-3,"Ff5":-4,"F5":-4,
            "Fs5":-4,"Gf5":-5,"G5":-5,"Gs5":-5,"Af5":-6,"A5":-6,"As5":-6
        };

        this.altoXPositions = {
            "Df3":6,"D3":6,"Ds3":6,"Ef3":5,"E3":5,"Es3":5,"Ff3":4,"F3":4,"Fs3":4,"Gf3":3,"G3":3,
            "Gs3":3,"Af3":2,"A3":2,"As3":2,"Bf3":1,"B3":1,"Bs3":1,"Cf4":0,"C4":0,"Cs4":0,"Df4":-1,
            "D4":-1,"Ds4":-1,"Ef4":-2,"E4":-2,"Es4":-2,"Ff4":-3,"F4":-3,"Fs4":-3,"Gf4":-4,"G4":-4,
            "Gs4":-4,"Af4":-5,"A4":-5,"As4":-5,"Bf4":-6,"B4":-6,"Bs4":-6
        };

        this.bassXPositions = {
            "Ef2":6,"E2":6,"Es2":6,"Ff2":5,"F2":5,"Fs2":5,"Gf2":4,"G2":4,"Gs2":4,"Af2":3,"A2":3,
            "As2":3,"Bf2":2,"B2":2,"Bs2":2,"Cf3":1,"C3":1,"Cs3":1,"Df3":0,"D3":0,"Ds3":0,"Ef3":-1,
            "E3":-1,"Es3":-1,"Ff3":-2,"F3":-2,"Fs3":-2,"Gf3":-3,"G3":-3,"Gs3":-3,"Af3":-4,"A3":-4,
            "As3":-4,"Bf3":-5,"B3":-5,"Bs3":-5,"Cf4":-6,"C4":-6,"Cs4":-6
        };

        //All possible notes in this program
        this.mainList = ["Ef2","E2","Es2","Ff2","F2","Fs2","Gf2","G2","Gs2","Af2","A2","As2",
            "Bf2","B2","Bs2","Cf3","C3","Cs3","Df3","D3","Ds3","Ef3","E3","Es3","Ff3","F3","Fs3",
            "Gf3","G3","Gs3","Af3","A3","As3","Bf3","B3","Bs3","Cf4","C4","Cs4","Df4","D4","Ds4",
            "Ef4","E4","Es4","Ff4","F4","Fs4","Gf4","G4","Gs4","Af4","A4","As4","Bf4","B4","Bs4",
            "Cf5","C5","Cs5","Df5","D5","Ds5","Ef5","E5","Es5","Ff5","F5","Fs5","Gf5","G5","Gs5",
            "Af5","A5","As5"];

        this.mainKeyIndices = {
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
        let noteIndices = this.mainKeyIndices[key];
        this.keyList = [];
        for(let i = 0; i < noteIndices.length; i++){
            this.keyList.push(this.mainList[noteIndices[i]]);
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
            degInd = fCPInd + cp[0][i] - 1;
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