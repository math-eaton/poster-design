// import '.src/css/style.css'
import { textSpheres } from "./textSpheres.js";
import { waveGen } from "./trochoidalWave.js";

window.onload = () => {
  const textPassage = "Cohort B, Docents, CS Cleaners, Sunchoked @ Trans-Pecos Ridgewood, NY 9 February 2024 at 8PM.";
  // textSpheres('sphereContainer1', textPassage);
  waveGen('waveContainer1');

};
