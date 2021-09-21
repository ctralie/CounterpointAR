
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
        let cubeGeometry = new THREE.BoxGeometry(1, 1, 1); 
        let sphereGeometry = new THREE.SphereGeometry(4, 32, 32);
        let material = new THREE.MeshPhongMaterial({ color: 0xCD853F });
        let cube = new THREE.Mesh(cubeGeometry, material);
        this.cube = cube;
        let sphere = new THREE.Mesh(sphereGeometry, material);
        this.sphere = sphere;
        cube.position.y = 0.5;

        sphere.position.z = -10;
        sphere.position.y = 5;

        let sceneRoot = new THREE.Group();
        this.sceneRoot = sceneRoot;
        sceneRoot.add(cube);
        sceneRoot.add(sphere);
        this.sceneRoot = sceneRoot;

        this.frameNum = 0;
    }

    /**
     * Perform a timestep of the animation
     * @param {float} delta Elapsed time, in milliseconds
     */
    animate(delta) {
        // Apply a small rotation to one of the cubes
        this.cube.rotation.y += delta * 0.1;
        // Not doing anything with this variable right now, but it could be useful
        this.frameNum += 1;
    }
}