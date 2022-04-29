
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
        
        // Step 2: Setup lighting
        //this allows for phong to occur
        const intensity = 1;
        const light = new THREE.DirectionalLight(this.matColor[0].color, intensity);
        light.position.set(-1, 10, 4);
        //light.position.set(1,0,5);
        this.scene.add(light);

        // Step 3: Initiate Mesh and Geometry
        this.partialStaff = new THREE.BoxGeometry(0.1,0.01,3);
        this.spaceBetweenStaff = new THREE.BoxGeometry(0.7,0.01,3);
        this.sceneRoot = new THREE.Group();
        this.xSpace = 0.5;
        this.frameNum = 0;
    }
    
    
    makeScene(ret){
        
        //make time sig and clef scene objects
        this.timeSig = ret[0];
        this.clef = ret[1];

        let staffGroup = new THREE.Group();

        for (let column = 0; column < 7; column += .5) {

            let newCol = new THREE.Group();

            let isSpace = parseInt(column) != column;
            console.log(isSpace);
            for(let i = 0; i < this.matColor.length; i++){
                if(isSpace){
                    if(column < 6.5){
                        let invmat = new THREE.MeshStandardMaterial({color: 0x000000});
                        invmat.visible = false;
                        newCol.add(new THREE.Mesh(this.spaceBetweenStaff,invmat));
                        newCol.children[i].position.x = -3;
                        newCol.children[i].position.y = -0.2;
                        newCol.children[i].position.z = i*-3 + 1.7;
                    }
                }
                else{
                    if(column == 0 || column == 6){
                        let invmat = new THREE.MeshStandardMaterial({color: 0x000000});
                        invmat.visible = false;
                        newCol.add(new THREE.Mesh(this.partialStaff,invmat));
                    }else{
                        newCol.add(new THREE.Mesh(this.partialStaff, 
                        new THREE.MeshStandardMaterial({color: this.matColor[i].color})));
                    }
                    newCol.children[i].position.x = -3;
                    newCol.children[i].position.z = i*-3 + 1.7;
                }
                
            }
            newCol.position.x += (1*column);
            staffGroup.add(newCol);
            
        }
        this.sceneRoot.add(staffGroup);
        
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