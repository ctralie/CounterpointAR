
/**
 * Setup a basic scene with two cubes and a sphere
 */

class BasicScene {

    /**
     * @constructor
     */
    constructor() {
        // Step 1: Create a three.js scene and camera
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        
        this.matColor = [{color: 0xFFFFFF},{color: 0xFFFFFF},{color: 0xff0000},{color: 0xffA500},
            {color: 0x33F3FF},{color: 0x00ff00},{color: 0x0000ff}];
        /*
        this.matColor = [{color: 0x33F3FF},{color: 0x33F3FF},{color: 0x33F3FF},
            {color: 0x33F3FF},{color: 0x33F3FF},{color: 0x33F3FF},
            {color: 0x33F3FF},{color: 0x33F3FF}];
        */
        // Step 2: Setup lighting
        //this allows for phong to occur
        const intensity = 1;
        const light = new THREE.DirectionalLight(this.matColor[0].color, intensity);
        light.position.set(-1, 10, 4);
        //light.position.set(1,0,5);
        this.scene.add(light);

        // Step 3: Initiate Mesh and Geometry
        this.partialStaff = new THREE.BoxGeometry(0.1,0.01,3);
        this.sceneRoot = new THREE.Group();
        this.xSpace = 0.5;
        this.frameNum = 0;
    }
    
    
    makeScene(ret){
        
        //make time sig and clef scene objects
        this.timeSig = ret[0];
        this.clef = ret[1];

        for (let column = 0; column < 5; column++) {
            let staffPieces = [];
            let fullStaff = new THREE.Group();
            for(let i = 0; i < this.matColor.length; i++){
                staffPieces.push(new THREE.Mesh(this.partialStaff, 
                new THREE.MeshStandardMaterial({color: this.matColor[i].color})))
                staffPieces[i].position.x = -2;
                staffPieces[i].position.z = i*-3 + 1.7;
                fullStaff.add(staffPieces[i]);
            }
            fullStaff.position.x += (1*column);
            this.sceneRoot.add(fullStaff);
        }

        /*
        for (let column = 0; column < 5; column++) {
            let staffPieces = [];
            let fullStaff = new THREE.Group();
            for(let i = 0; i < this.matColor.length; i++){
                staffPieces.push(new THREE.Mesh(this.partialStaff, 
                new THREE.MeshStandardMaterial({color: this.matColor[i].color})))
                staffPieces[i].position.x = -2;
                staffPieces[i].position.z = (i*(-2)) + 1.2;
                fullStaff.add(staffPieces[i]);
            }
            fullStaff.position.x += (1*column);
            this.sceneRoot.add(fullStaff);
        }
        */

    }

    /**
     * Perform a timestep of the animation
     * @param {float} delta Elapsed time, in milliseconds
     */
    animate(delta) {
        // Apply a small rotation to one of the cubes
        //this.cube.rotation.y += delta * 0.1;
        // Move the sphere up from the ground slowly
        //this.sphere.position.y += delta * 0.05;
        // Not doing anything with this variable right now, but it could be useful
        this.frameNum += 1;
    }
}