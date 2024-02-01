// Import Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Delaunator from 'delaunator';

export function waveGen(containerID) {
  // Find the container element
  const container = document.getElementById(containerID);
  if (!container) {
      console.error('Container not found:', containerID);
      return;
  }

  // Setup the scene and renderer
  const scene = new THREE.Scene();
  const aspectRatio = container.offsetWidth / container.offsetHeight;
  const frustumSize = 50; // Adjust the size based on your scene
  const camera = new THREE.OrthographicCamera(
      frustumSize * aspectRatio / -2,
      frustumSize * aspectRatio / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
  );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  renderer.setClearColor(0x000000);
  container.appendChild(renderer.domElement);


    // Add light
    const light = new THREE.PointLight(0xffff00, 1, 1000);
    light.position.set(10, 10, 10);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    // controls = new MapControls( camera, effect.domElement );
    // controls = new TrackballControls(camera, renderer.domElement);

    console.log('Controls after init:', controls); // Debug log
    controls.enableDamping = true; // Optional, but makes the controls smoother
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;

    controls.rotateSpeed = 5.0; // Increase rotation speed
    controls.zoomSpeed = 1.2; // Increase zoom speed
    controls.panSpeed = 0.8; // Increase pan speed
    controls.dynamicDampingFactor = 0.2; // Lower damping factor for quicker stop
    controls.staticMoving = false; // Set to true to stop immediately on mouse release

    // Function to generate an array of grayscale colors
    function generateGrayscaleColors(gridSize, wavePeriod) {
      const colors = [];
      const totalElements = gridSize * gridSize;
  
      for (let i = 0; i < totalElements; i++) {
          // Calculate position in the wave cycle (0 to 1)
          const cyclePosition = (i % wavePeriod) / wavePeriod;
  
          // Calculate brightness based on the cycle position
          const brightness = Math.floor(cyclePosition * 255);
          const color = (brightness << 16) | (brightness << 8) | brightness; // RGB values are the same for grayscale
          colors.push(color);
      }
      return colors;
  }
  
    // Create and add spheres to the scene
    const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const grid = [];
    const gridSize = 144;
    const spacing = 1;
    const wavePeriod = 6; // Define the period of the wave
    // const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff]; // Array of colors
    const colors = generateGrayscaleColors(gridSize, wavePeriod);
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
          const colorIndex = i * gridSize + j; // Linear index in the grid
          const sphereMaterial = new THREE.MeshStandardMaterial({ color: colors[colorIndex] });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.x = (i - gridSize / 2) * spacing;
          sphere.position.z = (j - gridSize / 2) * spacing;
          grid.push(sphere);
          scene.add(sphere);
      }
  }
      
    // Camera position for isometric view
    camera.position.set(50, 50, 50); // Adjust the position based on your grid size
    camera.lookAt(scene.position);
    camera.zoom = 3; // Adjust the zoom level
    camera.updateProjectionMatrix();

    // Trochoidal wave function
    function trochoidalWave(time, position) {
        return Math.sin(time + position.x * 0.5) * Math.cos(time + position.z * 0.5);
    }

// Function to create the initial wireframe using LineSegments with color
function createWireframe(grid, gridSize, wavePeriod) {
  const points = grid.map(sphere => [sphere.position.x, sphere.position.z]);
  const delaunay = Delaunator.from(points);
  const edges = new Set();
  const colors = generateGrayscaleColors(gridSize, wavePeriod);

  // Add edges to the set to ensure uniqueness
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
      edges.add(`${delaunay.triangles[i]}_${delaunay.triangles[i + 1]}`);
      edges.add(`${delaunay.triangles[i + 1]}_${delaunay.triangles[i + 2]}`);
      edges.add(`${delaunay.triangles[i + 2]}_${delaunay.triangles[i]}`);
  }

  const vertices = [];
  const vertexColors = [];

  edges.forEach(edge => {
      const [start, end] = edge.split("_").map(Number);
      vertices.push(
          grid[start].position.x, grid[start].position.y, grid[start].position.z,
          grid[end].position.x, grid[end].position.y, grid[end].position.z
      );

      // Assign color based on the grayscale color of the corresponding spheres
      const colorStart = new THREE.Color(colors[start % colors.length]);
      const colorEnd = new THREE.Color(colors[end % colors.length]);
      vertexColors.push(colorStart.r, colorStart.g, colorStart.b);
      vertexColors.push(colorEnd.r, colorEnd.g, colorEnd.b);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(vertexColors, 3));

  const material = new THREE.LineBasicMaterial({ 
      vertexColors: true // Enable vertex colors
  });

  const wireframe = new THREE.LineSegments(geometry, material);
  return wireframe;
}

// Function to update the wireframe
function updateWireframe(grid, wireframe) {
  const vertices = wireframe.geometry.attributes.position.array;
  const points = grid.map(sphere => [sphere.position.x, sphere.position.z]);
  const delaunay = Delaunator.from(points);
  const edges = new Set();

  // Add edges to the set
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
      edges.add(`${delaunay.triangles[i]}_${delaunay.triangles[i + 1]}`);
      edges.add(`${delaunay.triangles[i + 1]}_${delaunay.triangles[i + 2]}`);
      edges.add(`${delaunay.triangles[i + 2]}_${delaunay.triangles[i]}`);
  }

  let i = 0;
  edges.forEach(edge => {
      const [start, end] = edge.split("_").map(Number);
      vertices[i++] = grid[start].position.x; vertices[i++] = grid[start].position.y; vertices[i++] = grid[start].position.z;
      vertices[i++] = grid[end].position.x; vertices[i++] = grid[end].position.y; vertices[i++] = grid[end].position.z;
  });

  wireframe.geometry.attributes.position.needsUpdate = true;
}

// Create wireframe and add to scene
const wireframe = createWireframe(grid);
scene.add(wireframe);



function animate() {
  requestAnimationFrame(animate);

  // Update sphere positions and wireframe
  const time = Date.now() * 0.001;
  grid.forEach(sphere => {
      sphere.position.y = trochoidalWave(time, sphere.position);
  });
  updateWireframe(grid, wireframe);

  renderer.render(scene, camera);
}

    
// Start animation loop
    animate();
}
