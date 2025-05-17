

export function concentric(containerID) {
    // The p5 instance mode requires a sketch to be defined as a function that takes a single argument 'p'
    // This 'p' argument represents a reference to the p5 instance
    const sketch = (p) => {
      // Setup function to initialize the canvas
      p.setup = () => {
        // Create a p5 canvas. Adjust the size as needed or use the container's dimensions
        const container = document.getElementById(containerID);
        p.createCanvas(container.offsetWidth, container.offsetHeight);
        p.noLoop(); // No need to continuously draw unless the canvas changes size or other parameters
      };
  
      // Draw function to render the sketch
      p.draw = () => {
        p.background(240); // Set background color
  
        // Variables for the square drawing loop
        let sideLength = Math.min(p.width, p.height) * 0.5; // Start with a square half the size of the smallest dimension
        const center = { x: p.width / 2, y: p.height / 2 }; // Center of the canvas
  
        // Loop to draw the squares
        while (sideLength > 1) { // Continue until the squares are effectively a point
          p.rectMode(p.CENTER); // Draw squares from their center
          p.square(center.x, center.y, sideLength); // Draw square
  
          // Scale down for the next square
          sideLength *= 0.9;
        }
      };
    };
  
    // Create a new p5 instance using our sketch definition and the specified container
    new p5(sketch, containerID);
  }
  