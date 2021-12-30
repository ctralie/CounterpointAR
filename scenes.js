
/**
 * Setup a basic scene with two cubes and a sphere
 */

class BasicScene {

    constructor() {
        // Step 1: Create a three.js scene and camera
        let scene = new THREE.Scene();
        this.scene = scene;
        let camera = new THREE.Camera();
        this.camera = camera;

        

        // Step 2: Setup lighting
        //this allows for phong to occur
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        //light.position.set(-1, 2, 4);
        light.position.set(1,0,5);
        scene.add(light);

        // Step 3: Initiate Mesh and Geometry
        this.partialStaff = new THREE.BoxGeometry(0.1,0.01,2);
        this.sceneRoot = new THREE.Group();

        this.rMat = new THREE.MeshStandardMaterial({color: 0xff0000});
        this.oMat = new THREE.MeshStandardMaterial({color: 0xffA500});
        this.yMat = new THREE.MeshStandardMaterial({color: 0xffff00});
        this.gMat = new THREE.MeshStandardMaterial({color: 0x00ff00});
        this.bMat = new THREE.MeshStandardMaterial({color: 0x0000ff});
        this.pMat = new THREE.MeshStandardMaterial({color: 0x080080});


        this.makeStaff();
        this.frameNum = 0;
    }
    
    
    makeStaff(){    
        for (let column = 0; column < 5; column++) {
            let staffPieces = [];
            staffPieces.push(new THREE.Mesh(this.partialStaff, this.rMat));
            staffPieces.push(new THREE.Mesh(this.partialStaff, this.oMat));
            staffPieces.push(new THREE.Mesh(this.partialStaff, this.yMat))
            staffPieces.push(new THREE.Mesh(this.partialStaff, this.gMat));
            staffPieces.push(new THREE.Mesh(this.partialStaff, this.bMat));
            staffPieces.push(new THREE.Mesh(this.partialStaff, this.pMat));
            let fullStaff = new THREE.Group();
            for(let i = 0; i < staffPieces.length; i++){
                staffPieces[i].position.x = -2;
                staffPieces[i].position.z = i*(-2);
                fullStaff.add(staffPieces[i]);
            }
            fullStaff.position.x += (1*column);
            this.sceneRoot.add(fullStaff);
        }
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