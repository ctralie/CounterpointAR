
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
        light.position.set(-1, 2, 4);
        scene.add(light);

        // Step 3: Setup geometry

        let staffGeometry = new THREE.BoxGeometry(0.1,0.01,15);
        //let staffGeometry = new THREE.BoxGeometry(0.1,15, 0.01);
        let staffMaterial = new THREE.MeshStandardMaterial({color: 0x00ff00});
        let staffL0 = new THREE.Mesh(staffGeometry, staffMaterial);
        this.staffL0 = staffL0;
        staffL0.position.x = -2;
        let staffL1 = new THREE.Mesh(staffGeometry, staffMaterial);
        this.staffL1 = staffL1;
        staffL1.position.x = -1;
        let staffL2 = new THREE.Mesh(staffGeometry, staffMaterial);
        this.staffL2 = staffL2;
        staffL2.position.x = 0;
        let staffL3 = new THREE.Mesh(staffGeometry, staffMaterial);
        this.staffL3 = staffL3;
        staffL3.position.x = 1;
        let staffL4 = new THREE.Mesh(staffGeometry, staffMaterial);
        this.staffL4 = staffL4;
        staffL4.position.x = 2;

        let sceneRoot = new THREE.Group();
        this.sceneRoot = sceneRoot;
        sceneRoot.add(staffL0);
        sceneRoot.add(staffL1);
        sceneRoot.add(staffL2);
        sceneRoot.add(staffL3);
        sceneRoot.add(staffL4);
        this.sceneRoot = sceneRoot;
        this.frameNum = 0;
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