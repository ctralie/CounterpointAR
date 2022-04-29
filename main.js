function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

class TestClass {
    constructor(fileName, useCF, useCP,capture) {
        this.p5Obj = capture;
        this.useCantusFirmus = useCF;
        this.useCounterpoint = useCP;
        this.notes= new RollReader();
        this.notes.loadFile(fileName);
        this.doSomethingWithFile();
    }

    doSomethingWithFile() {
        if (!this.notes.fileReady) {
            // "this" makes sure that when doSomethingWithData is called 
            // it actually is called on the current object
            this.notes.data.then(this.doSomethingWithFile.bind(this));
        }
        else {
            // Do some stuff now that it's ready
            //console.log("Lines after finished" + this.notes.lines);
            let SPL = new ScalePositionLists(this.notes.parseInfo());
            this.digAud = new DAGenerator(SPL);
            this.scene = new BasicScene();
            this.scene.makeScene(this.notes.parseInfo());
            const posAR = new PositionalAR(this.scene,
            this.digAud, this.useCantusFirmus, this.useCounterpoint);
        }
    }
}

let useCF = (getParameterByName("cf") === 'true');
let useCP = (getParameterByName("cp") === 'true');
let filename = getParameterByName("tune");

let obj = new TestClass(filename, useCF, useCP);


