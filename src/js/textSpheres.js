import p5 from 'p5';

export function textSpheres(containerID, userText) {
    new p5((p) => {
      let textBlocks;
      let angle = 0;
  
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL).parent(containerID);
        textBlocks = userText.split('.').filter(Boolean);
      };
  
      p.draw = () => {
        p.background(255);
        p.orbitControl(); // Allows the user to rotate the view using the mouse
  
        for (let i = 0; i < textBlocks.length; i++) {
          p.push();
          let offset = 150 * i;
          p.translate(-p.width / 4 + offset, -p.height / 4 + offset, -offset);
          p.rotateX(angle);
          p.rotateY(angle * 0.3);
          p.rotateZ(angle * 0.2);
          p.stroke(0);
          p.noFill();
          p.sphere(70);
          p.pop();
        }
  
        angle += 0.005;
      };
  
      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    });
  }
  