import p5 from 'p5';

export function textSpheres(containerID, userText) {
    new p5((p) => {
        let textBlocks;
        let angle = 0;
        let orbitAngles = [];
        let font;
        let isRotating = true;

        p.preload = () => {
            // Load a font
            font = p.loadFont('fonts/Cursive.ttf'); // Replace with the actual path to your font file
        };

        p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL).parent(containerID);
            p.textFont(font); // Set the loaded font
            textBlocks = userText.split('.').filter(Boolean);

            // Initialize orbit angles for each block of text
            for (let i = 0; i < textBlocks.length; i++) {
                orbitAngles.push(0);
            }
        };

        p.draw = () => {
            p.background(255);
            p.orbitControl();

            for (let i = 0; i < textBlocks.length; i++) {
                p.push();
                let offset = 150 * i;
                p.translate(-p.width / 4 + offset, -p.height / 4 + offset, -offset);

                if (isRotating) {
                    angle += 0.005;
                    orbitAngles[i] += 0.02;
                }

                p.rotateX(angle);
                p.rotateY(angle * 0.3);
                p.rotateZ(angle * 0.2);
                p.stroke(0);
                p.noFill();
                p.sphere(70);
                drawOrbitingText(textBlocks[i], 100, orbitAngles[i], p);
                p.pop();
            }
        };

        function drawOrbitingText(text, radius, orbitAngle, p) {
            const textLength = text.length;
            const spacing = 360 / textLength; // Adjust based on text length
        
            for (let i = 0; i < textLength; i++) {
                const char = text[i];
                const angle = p.radians(i * spacing) + orbitAngle;
        
                const x = radius * Math.cos(angle);
                const y = 0; // Fixed latitude on the sphere
                const z = radius * Math.sin(angle);
        
                p.push();
                p.translate(x, y, z);
                p.rotateX(p.HALF_PI);
                p.rotateZ(-angle);
                p.fill(255, 0, 0); // Bright red text for visibility
                p.textSize(10);
                p.textAlign(p.CENTER, p.CENTER);
                p.text(char, 0, 0);
                p.pop();
            }
        }

        p.keyPressed = () => {
            if (p.key === 'r' || p.key === 'R') {
                isRotating = !isRotating; // Toggle the rotation state
            }
        };

                                
        p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
    });
}
