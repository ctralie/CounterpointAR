
/**
 * Setup a basic scene with two cubes and a sphere
 * @param {boolean} useFog
 *      Whether to use fog 
 */

class BasicScene {
    constructor(useFog) {
        // Step 1: Create a three.js scene and camera
        let scene = new THREE.Scene();
        this.scene = scene;
        let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.camera = camera;

        // Step 2: Setup lighting
        //this allows for phong to occur
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
        if (useFog) {
            const near = 0;
            const far = 2;
            const color = 'lightblue';
            scene.fog = new THREE.Fog(color, near, far);
            scene.background = new THREE.Color(color);
        }

        // Step 3: Setup geometry
        let cubeGeometry = new THREE.BoxGeometry(5, 5, 5); // three.js line 29094
        let sphereGeometry = new THREE.SphereGeometry(4, 32, 32); //three.js line 29075
        let material = new THREE.MeshPhongMaterial({ color: 0xCD853F });
        let cube = new THREE.Mesh(cubeGeometry, material);
        this.cube = cube;
        let cube2 = new THREE.Mesh(cubeGeometry, material);
        this.cube2 = cube2;
        let sphere = new THREE.Mesh(sphereGeometry, material);
        this.sphere = sphere;
        cube.position.y -= 1;
        cube.position.z = -10;
        cube2.position.x = -5;
        cube2.position.y -= 1;
        cube2.position.z = -10;

        sphere.position.z = -10;
        sphere.position.y = 5;

        let sceneRoot = new THREE.Group();
        this.sceneRoot = sceneRoot;
        sceneRoot.add(cube);
        sceneRoot.add(cube2);
        sceneRoot.add(sphere);
        sceneRoot.position.z = 0;
        sceneRoot.position.x = -0.3;
        sceneRoot.position.y = 0.5;
        this.sceneRoot = sceneRoot;

        this.frameNum = 0;
    }

    /**
     * Perform a timestep of the animation
     * @param {float} delta Elapsed time, in milliseconds
     */
    animate(delta) {
        // Apply a small rotation to one of the cubes
        this.cube.rotation.y += delta * 0.0006;
        this.sphere.position.z += delta*0.0003;

        this.frameNum += 1;
    }
}