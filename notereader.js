class NoteReader {

    constructor(filename){
        let fReader = new FileReader();
        let file = "songs/" + filename;

        fReader.readAsText(file);

        fReader.onload = function(){
            console.log(fReader.result);
        };

        fReader.onerror = function(){
            console.log(fReader.error);
        };

    }
}