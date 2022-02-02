class NoteReader {

    

    constructor(){

        let omittedIndex = 6;

        let usefulSegments = [];

        let songFile = new XMLHttpRequest();
        songFile.open("GET","song.txt",true);
        songFile.onreadystatechange = function(){
            if(songFile.readyState === 4){
                if(songFile.status === 200){
                    let fileText = songFile.responseText;
                    let fileSegments = fileText.split("\n");
                    console.log(fileSegments);
                    for(let i = this.ommitedIndex; i < fileSegments.length; i++){
                        usefulSegments.push(fileSegments[i]);
                        console.log(fileSegments[i]);
                    }
                }
            }
        }
        console.log(usefulSegments);
        if(usefulSegments.length > 0){
            this.gotInfo = true;
        }
        songFile.send(null);

        

    }
}