import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function textSpheres(containerID, userText) {
    let scene, camera, renderer, sphere, textSprites = [], isRotating = true;
    let textBlocks = [userText]; // Treat all text as a single block
    let textSpritesLoaded = false;

    function init() {
        // Create the scene
        scene = new THREE.Scene();
        let width = window.innerWidth;
        let height = window.innerHeight;

        // Camera setup
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 2000);
        camera.position.z = 400;

        // Renderer setup
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        document.getElementById(containerID).appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true; // Optional, but this adds inertia to the controls
        controls.dampingFactor = 0.05;
        controls.rotateSpeed = 0.2;    

        // Sphere creation
        const geometry = new THREE.SphereGeometry(64, 64, 64);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

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
            const fullText = textBlocks.join(' '); // Combine all text
            const characters = fullText.split('');
            const sphereRadius = 40; // Sphere's radius
            const spiralTurns = 5; // Number of turns in the spiral
            const totalCharacters = characters.length;
    
            characters.forEach((char, charIndex) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = 64; // Adjust as needed
                canvas.height = 64;
                ctx.font = '48px VT323';
                ctx.fillStyle = 'red';
                ctx.fillText(char, canvas.width / 2, canvas.height / 2);
    
                const texture = new THREE.CanvasTexture(canvas);
                const material = new THREE.SpriteMaterial({ map: texture });
                const sprite = new THREE.Sprite(material);
                sprite.scale.set(10, 10, 1); // Adjust as needed
    
                // Calculate the spiral position
                const phi = Math.PI * (charIndex / totalCharacters); // Linear change from north to south
                const theta = Math.PI * spiralTurns * (charIndex / totalCharacters); // Spiral change around the sphere
    
                sprite.position.x = sphere.position.x + sphereRadius * Math.sin(phi) * Math.cos(theta);
                sprite.position.y = sphere.position.y + sphereRadius * Math.cos(phi);
                sprite.position.z = sphere.position.z + sphereRadius * Math.sin(phi) * Math.sin(theta);
    
                // sprite.lookAt(sphere.position); // Orient the text towards the center of the sphere

    
                scene.add(sprite);
                textSprites.push(sprite);
            });

            textSpritesLoaded = true;

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
    
        textSprites.forEach(sprite => {
            // Calculate the direction from the sprite to the camera
            const spritePosition = new THREE.Vector3();
            sprite.getWorldPosition(spritePosition);
            const toCameraDirection = camera.position.clone().sub(spritePosition).normalize();
    
            // Calculate the angle for correct orientation
            const angle = Math.atan2(toCameraDirection.x, toCameraDirection.z);
            sprite.rotation.y = angle + Math.PI; // Add Math.PI to flip the orientation
        });
    
        if (isRotating) {
            sphere.rotation.x += 0.005;
            sphere.rotation.y += 0.005;
        }
    
        renderer.render(scene, camera);
    }
            
    init();
    animate();
}
