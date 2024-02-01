import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function textSpheres(containerID, userText) {
    let scene, camera, renderer, sphere, textSprites = [], isRotating = true;
    let textBlocks = userText.split(' '); // Split the text into words
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
        const geometry = new THREE.SphereGeometry(12, 64, 64);
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
            const totalCharacters = userText.replace(/\s+/g, '').length;
            let currentCharIndex = 0;
            const sphereRadius = 70; // Define the sphere radius
    
            textBlocks.forEach((word, wordIndex) => {
                const chars = Array.from(word);
                const wordLength = chars.length;
                const wordStartAngle = (2 * Math.PI / totalCharacters) * currentCharIndex;
                const wordEndAngle = (2 * Math.PI / totalCharacters) * (currentCharIndex + wordLength - 1);
    
                // Check if the word is between 3 o'clock and 9 o'clock
                const isFlipped = (wordStartAngle > Math.PI / 2 && wordEndAngle < 3 * Math.PI / 2);
    
                if (isFlipped) {
                    chars.reverse(); // Reverse the order of characters for flipped words
                }
    
                chars.forEach(char => {
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
        
                    const theta = (2 * Math.PI / totalCharacters) * currentCharIndex;
                    sprite.position.x = sphere.position.x + sphereRadius * Math.cos(theta);
                    sprite.position.y = sphere.position.y;
                    sprite.position.z = sphere.position.z + sphereRadius * Math.sin(theta);
    
                    adjustSpritePosition(sprite, currentCharIndex, totalCharacters, sphereRadius);
    
                    if (isFlipped) {
                        sprite.scale.x = -sprite.scale.x; // Flip the sprite on the x-axis
                    }
    
                    scene.add(sprite);
                    textSprites.push(sprite);
                    currentCharIndex++;
                });
    
                currentCharIndex++; // Add space for the next word
            });
    
            textSpritesLoaded = true;
        });
    }
    
    function adjustSpritePosition(sprite, charIndex, totalCharacters, sphereRadius) {
        const theta = (2 * Math.PI / totalCharacters) * charIndex;
        const phi = Math.PI / 4; // Adjust for the vertical position on the sphere

        sprite.position.x = sphere.position.x + sphereRadius * Math.sin(phi) * Math.cos(theta);
        sprite.position.y = sphere.position.y + sphereRadius * Math.cos(phi);
        sprite.position.z = sphere.position.z + sphereRadius * Math.sin(phi) * Math.sin(theta);
    }

    
    function shouldReverseWord(wordIndex, words, camera, sphere) {
        // Calculate the word's angular position on the sphere
        const totalCharacters = words.join(' ').length;
        let charIndexOffset = 0;
        for (let i = 0; i < wordIndex; i++) {
            charIndexOffset += words[i].length + 1; // +1 for the space
        }
        const wordMidCharIndex = charIndexOffset + words[wordIndex].length / 2;
        const theta = (2 * Math.PI / totalCharacters) * wordMidCharIndex;

        // Calculate the position of the word on the sphere
        const wordPosition = new THREE.Vector3(
            sphere.position.x + sphere.geometry.parameters.radius * Math.cos(theta),
            sphere.position.y,
            sphere.position.z + sphere.geometry.parameters.radius * Math.sin(theta)
        );

        // Calculate the angle between the word's position and the camera's position
        const cameraDirection = new THREE.Vector3().subVectors(camera.position, sphere.position).normalize();
        const wordDirection = new THREE.Vector3().subVectors(wordPosition, sphere.position).normalize();
        const angle = wordDirection.angleTo(cameraDirection);

        // Reverse the word if it is on the far side of the sphere
        return angle > Math.PI / 2;
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
            // Orient each character to face the camera
            orientSpriteToCamera(sprite);

            // Flip the sprite if necessary
            flipSpriteIfNecessary(sprite);
        });

        if (isRotating) {
            sphere.rotation.y += 0.005;
        }

        renderer.render(scene, camera);
    }

    function orientSpriteToCamera(sprite) {
        sprite.lookAt(camera.position);
    }

    function flipSpriteIfNecessary(sprite) {
        const spritePosition = new THREE.Vector3().setFromMatrixPosition(sprite.matrixWorld);
        const toCamera = new THREE.Vector3().subVectors(camera.position, spritePosition);
        const toCenter = new THREE.Vector3().subVectors(sphere.position, spritePosition);
        if (toCamera.dot(toCenter) < 0) {
            sprite.scale.x = -Math.abs(sprite.scale.x); // Flip horizontally
        } else {
            sprite.scale.x = Math.abs(sprite.scale.x);
        }
    }

    init();
    animate();
}
