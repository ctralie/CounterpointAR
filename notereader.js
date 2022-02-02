class NoteReader {

    constructor() {
        this.fileReady = false;
        this.data = null; // Reference to promise
        this.lines = [];
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
                        if (lines[i][0] != "#") {
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
}