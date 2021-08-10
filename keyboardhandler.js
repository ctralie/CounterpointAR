
class KeyboardHandler {
    constructor() {
        this.keysDown = {87:false, 83:false, 65:false, 68:false, 67:false, 69:false};
        this.walkspeed = 2.5;//How many meters per second
        this.movelr = 0;//Moving left/right
        this.movefb = 0;//Moving forward/backward
        this.moveud = 0;//Moving up/down

        document.addEventListener('keydown', this.keyDown.bind(this), true);
        document.addEventListener('keyup', this.keyUp.bind(this), true);
    }
    /**
     * React to a key being pressed
     * @param {keyboard callback} evt 
     */
    keyDown(evt) {
        let newKeyDown = false;
        if (evt.keyCode == 87) { //W
            if (!this.keysDown[87]) {
                newKeyDown = true;
                this.keysDown[87] = true;
                this.movefb = 1;
            }
        }
        else if (evt.keyCode == 83) { //S
            if (!this.keysDown[83]) {
                newKeyDown = true;
                this.keysDown[83] = true;
                this.movefb = -1;
            }
        }
        else if (evt.keyCode == 65) { //A
            if (!this.keysDown[65]) {
                newKeyDown = true;
                this.keysDown[65] = true;
                this.movelr = -1;
            }
        }
        else if (evt.keyCode == 68) { //D
            if (!this.keysDown[68]) {
                newKeyDown = true;
                this.keysDown[68] = true;
                this.movelr = 1;
            }
        }
        else if (evt.keyCode == 67) { //C
            if (!this.keysDown[67]) {
                newKeyDown = true;
                this.keysDown[67] = true;
                this.moveud = -1;
            }
        }
        else if (evt.keyCode == 69) { //E
            if (!this.keysDown[69]) {
                newKeyDown = true;
                this.keysDown[69] = true;
                this.moveud = 1;
            }
        }
    }
    
    /**
     * React to a key being released
     * @param {keyboard callback} evt 
     */
    keyUp(evt) {
        if (evt.keyCode == 87) { //W
            this.movefb = 0;
            this.keysDown[87] = false;
        }
        else if (evt.keyCode == 83) { //S
            this.movefb = 0;
            this.keysDown[83] = false;
        }
        else if (evt.keyCode == 65) { //A
            this.movelr = 0;
            this.keysDown[65] = false;
        }
        else if (evt.keyCode == 68) { //D
            this.movelr = 0;
            this.keysDown[68] = false;
        }
        else if (evt.keyCode == 67) { //C
            this.moveud = 0;
            this.keysDown[67] = false;
        }
        else if (evt.keyCode == 69) { //E
            this.moveud = 0;
            this.keysDown[69] = false;
        }
    }    
}
