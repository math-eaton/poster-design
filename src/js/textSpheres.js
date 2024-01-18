import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function textSpheres(containerID, userText) {
    let scene, camera, renderer, spheres = [], textSprites = [], isRotating = true;
    let orbitAngles = [];
    let textBlocks = userText.split('.').filter(Boolean);
    let textSpritesLoaded = false;

    function init() {
        // Create the scene
        scene = new THREE.Scene();
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Camera setup
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 400;

        // Renderer setup
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        document.getElementById(containerID).appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Optional, but this adds inertia to the controls
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.1;    

        // Sphere creation
        for (let i = 0; i < textBlocks.length; i++) {
            const geometry = new THREE.SphereGeometry(70, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.x = (i - textBlocks.length / 2) * 150;
            scene.add(sphere);
            spheres.push(sphere);
            orbitAngles.push(0);
        }

        // Text sprite creation
        createTextSprites();

        // Handle window resize
        window.addEventListener('resize', onWindowResize, false);

        // Handle key press
        document.addEventListener('keypress', onKeyPress, false);
    }

    function createTextSprites() {
        const loader = new FontLoader();
    
        loader.load('fonts/VT323_Regular.json', function (font) {
            textBlocks.forEach((text, index) => {
                // Create a canvas and draw your text on it
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.font = '48px VT323'; // Set the font size and family
                ctx.fillStyle = 'red'; // Set text color
                ctx.fillText(text, 0, 50); // Draw the text
    
                // Use the canvas as a texture
                const texture = new THREE.CanvasTexture(canvas);
                const material = new THREE.SpriteMaterial({ map: texture });
    
                // Create a sprite with the material
                const sprite = new THREE.Sprite(material);
                sprite.position.x = (index - textBlocks.length / 2) * 150;
                sprite.position.y = 100; // Adjust as needed
                sprite.scale.set(100, 50, 10); // Adjust the size as needed

                scene.add(sprite);
                textSprites.push(sprite);
            });
        });
    }
        
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onKeyPress(event) {
        if (event.key === 'r' || event.key === 'R') {
            isRotating = !isRotating;
        }
    }

    function animate() {
        requestAnimationFrame(animate);

        if (isRotating && textSpritesLoaded) { // Check flag before modifying sprites
            spheres.forEach((sphere, index) => {
                sphere.rotation.x += 0.005;
                sphere.rotation.y += 0.005;

                if (textSprites[index]) { // Additional safety check
                    textSprites[index].rotation.y += 0.005;
                }
            });
        }

        // controls.update();
        renderer.render(scene, camera);
    }

    init();
    animate();
}
