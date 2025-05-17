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

  let autoRotate = true;

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
    controls.enableDamping = true;
    controls.dampingFactor = 0.5;
    controls.enableZoom = true;
    controls.autoRotate = true; // Auto-rotate is on by default
    controls.autoRotateSpeed = 1.0;


    document.addEventListener('keypress', function(event) {
      if (event.key === 'r' || event.key === 'R') {
          controls.autoRotate = !controls.autoRotate; // Toggle auto-rotation
      }
  });
    
  
    // Create and add spheres to the scene
    const sphereGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const grid = [];
    const gridSize = 72;
    const spacing = 0.5;
    
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
          const sphereMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            wireframe: false,
            opacity: 0.85,
            alphaHash: true,
           });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.x = (i - gridSize / 2) * spacing;
          sphere.position.z = (j - gridSize / 2) * spacing;
          grid.push(sphere);
          scene.add(sphere);
      }
  }

    const rotatedGrid = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
          const colorIndex = i * gridSize + j; // Linear index in the grid
          const sphereMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000000,
            wireframe: false,
            opacity: 0.58,
            alphaHash: true,
          });
          const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
          sphere.position.x = (j - gridSize / 2) * spacing; // Swapped i and j
          sphere.position.z = -(i - gridSize / 2) * spacing; 
          rotatedGrid.push(sphere);
          scene.add(sphere);
      }
    }

      
    // Camera position for isometric view
    camera.position.set(50, 50, 50); // Adjust the position based on your grid size
    camera.lookAt(scene.position);
    camera.zoom = 1.5; // Adjust the zoom level
    camera.updateProjectionMatrix();

    // Random phase offset between 1 and 360 degrees, converted to radians
    const ampMod = 2
    const randomPhaseOffset = Math.random() * Math.PI; // 180 degrees in radians
    const primaryWaveAmplitude = (Math.random() * .75) * ampMod
    const secondaryWaveAmplitude = (Math.random() * 2) * ampMod;

    // Trochoidal wave function
    function trochoidalWave(time, position) {
        return primaryWaveAmplitude * Math.sin(time + position.x * 0.5) * Math.cos(time + position.z * 0.5);
    }

    function trochoidalPhaseWave(time, position) {
      const rotatedX = (position.x - position.z) / Math.sqrt(2);
      const rotatedZ = (position.x + position.z) / Math.sqrt(2);
      return secondaryWaveAmplitude * Math.sin(time + rotatedX * 0.5 + randomPhaseOffset) * Math.cos(time + rotatedZ * 0.5 + randomPhaseOffset);
    }
  
    function getColorFromPosition(yPosition) {
      // adjust the abc values to change the hue, saturation, and lightness respectively
      return new THREE.Color().setHSL(.666 +(1-(yPosition) * .2), 0.7, 0.5);
    }
    

// Function to create the initial wireframe using LineSegments with dynamic Y-based color
function createWireframe(grid) {
  const points = grid.map(sphere => [sphere.position.x, sphere.position.z]);
  const delaunay = Delaunator.from(points);
  const edges = new Set();

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

      // Dynamic color calculation based on Y position
      const colorStart = getColorFromPosition(grid[start].position.y);
      const colorEnd = getColorFromPosition(grid[end].position.y);
      vertexColors.push(colorStart.r, colorStart.g, colorStart.b);
      vertexColors.push(colorEnd.r, colorEnd.g, colorEnd.b);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(vertexColors, 3));

  const material = new THREE.LineBasicMaterial({ 
      vertexColors: true,
  });

  const wireframe = new THREE.LineSegments(geometry, material);
  return wireframe;
}

// Function to update the wireframe with dynamic Y-based color
function updateWireframe(grid, wireframe) {
  const vertices = wireframe.geometry.attributes.position.array;
  const vertexColors = wireframe.geometry.attributes.color.array;
  const points = grid.map(sphere => [sphere.position.x, sphere.position.z]);
  const delaunay = Delaunator.from(points);
  const edges = new Set();

  // Add edges to the set
  for (let i = 0; i < delaunay.triangles.length; i += 3) {
      edges.add(`${delaunay.triangles[i]}_${delaunay.triangles[i + 1]}`);
      edges.add(`${delaunay.triangles[i + 1]}_${delaunay.triangles[i + 2]}`);
      edges.add(`${delaunay.triangles[i + 2]}_${delaunay.triangles[i]}`);
  }

  let vertexIndex = 0;
  edges.forEach(edge => {
      const [start, end] = edge.split("_").map(Number);
      // Update vertex positions (unchanged)
      vertices[vertexIndex * 3] = grid[start].position.x;
      vertices[vertexIndex * 3 + 1] = grid[start].position.y;
      vertices[vertexIndex * 3 + 2] = grid[start].position.z;
      vertexIndex++;
      vertices[vertexIndex * 3] = grid[end].position.x;
      vertices[vertexIndex * 3 + 1] = grid[end].position.y;
      vertices[vertexIndex * 3 + 2] = grid[end].position.z;
      vertexIndex++;

      // Update colors based on new Y positions
      const colorStart = getColorFromPosition(grid[start].position.y);
      const colorEnd = getColorFromPosition(grid[end].position.y);
      vertexColors[(vertexIndex - 2) * 3] = colorStart.r;
      vertexColors[(vertexIndex - 2) * 3 + 1] = colorStart.g;
      vertexColors[(vertexIndex - 2) * 3 + 2] = colorStart.b;
      vertexColors[vertexIndex * 3 - 3] = colorEnd.r;
      vertexColors[vertexIndex * 3 - 2] = colorEnd.g;
      vertexColors[vertexIndex * 3 - 1] = colorEnd.b;
  });

  wireframe.geometry.attributes.position.needsUpdate = true;
  wireframe.geometry.attributes.color.needsUpdate = true; // Mark the color attribute for update
}

// Create wireframe and add to scene
const wireframe = createWireframe(grid);
// scene.add(wireframe);

const rotatedWireframe = createWireframe(rotatedGrid);
// scene.add(rotatedWireframe);


function animate() {
  requestAnimationFrame(animate);

  controls.update();

  // Edge margin where the exponential fade starts
  const edgeMargin = spacing * 30; // Adjust based on visual preference
  const decayRate = 1 / edgeMargin; // Decay rate, adjust for how quickly the fade happens

  // Calculate maximum distances from the center to the edge
  const maxDistanceX = (gridSize / 2) * spacing;
  const maxDistanceZ = (gridSize / 2) * spacing;

  // Update sphere positions and wireframes
  const time = Date.now() * 0.00025;
  grid.forEach((sphere, index) => {
    // Calculate distance to the nearest edge
    const distanceToEdgeX = Math.max(0, maxDistanceX - Math.abs(sphere.position.x));
    const distanceToEdgeZ = Math.max(0, maxDistanceZ - Math.abs(sphere.position.z));
    const minDistanceToEdge = Math.min(distanceToEdgeX, distanceToEdgeZ);

    // Apply exponential decay based on the minimum distance to the edge
    const decayFactor = Math.exp(-decayRate * (edgeMargin - minDistanceToEdge));

    const wave1 = trochoidalWave(time, sphere.position) * decayFactor;
    const wave2 = trochoidalPhaseWave(time, sphere.position) * decayFactor;
    sphere.position.y = (wave1 + wave2) / 2; // amplitude of interfered waves

    // Update the color of the sphere based on its new Y position
    sphere.material.color = getColorFromPosition(sphere.position.y);

    // Apply the same logic to the rotated grid
    rotatedGrid[index].position.y = sphere.position.y; // Use the same Y position for consistency
    rotatedGrid[index].material.color = getColorFromPosition(sphere.position.y);
  });

  updateWireframe(grid, wireframe);
  updateWireframe(rotatedGrid, rotatedWireframe);

  renderer.render(scene, camera);
}
    
// Start animation loop
    animate();
}
