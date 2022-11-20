function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

class CanvasWrapper {
    constructor(fileName, useCF, useCP) {
        this.useCantusFirmus = useCF;
        this.useCounterpoint = useCP;
        this.notes= new RollReader();
        this.notes.loadFile(fileName);
        this.initializeCanvas();
    }

    initializeCanvas() {
        if (!this.notes.fileReady) {
            // "this" makes sure that when doSomethingWithData is called 
            // it actually is called on the current object
            this.notes.data.then(this.initializeCanvas.bind(this));
        }
        else {
            // Do some stuff now that it's ready
            //console.log("Lines after finished" + this.notes.lines);
            let SPL = new ScalePositionLists(this.notes.formatInfo());
            this.digAud = new DAGenerator(SPL);
            
            let counterpointScene = new CounterpointScene(this.notes,this.digAud, this.useCantusFirmus, this.useCounterpoint);
            new ARCanvas("arcanvas", counterpointScene);
        }
    }
}

let useCF = (getParameterByName("cf") === 'true');
let useCP = (getParameterByName("cp") === 'true');
let filename = getParameterByName("tune");

new CanvasWrapper(filename, useCF, useCP);
