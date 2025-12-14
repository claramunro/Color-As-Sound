// Color As Sound - p5.js version
// Each pixel's color is converted into sound

let video;
let videoScale = 20;
let cols, rows;
let started = false;

// Sound samples
let redSound, greenSound, blueSound, purpleSound, yellowSound, pinkSound;
let soundsLoaded = false;

// Sample points for color detection
let samplePoints = [];

// Cooldown to prevent sound spam
let lastTrigger = {};
const COOLDOWN = 100; // ms between triggers

function preload() {
  soundFormats('mp3', 'wav');
  redSound = loadSound('cinco.mp3');
  greenSound = loadSound('dope2_converted.wav');
  blueSound = loadSound('Dusty_Mirror.wav');
  purpleSound = loadSound('Dusty_Mirror.wav');
  yellowSound = loadSound('123.wav');
  pinkSound = loadSound('Lounge_Vibes.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  noStroke();
  frameRate(20);

  cols = floor(width / videoScale);
  rows = floor(height / videoScale);

  // Define sample points (relative positions)
  samplePoints = [
    { x: 0.08, y: 0.12 },
    { x: 0.47, y: 0.09 },
    { x: 0.86, y: 0.62 },
    { x: 0.23, y: 0.75 },
    { x: 0.47, y: 0.75 },
    { x: 0.78, y: 0.75 }
  ];

  // Initialize cooldowns
  for (let i = 0; i < samplePoints.length; i++) {
    lastTrigger[i] = 0;
  }

  // Set up start button
  document.getElementById('start-btn').addEventListener('click', startExperience);
}

function startExperience() {
  // Start video capture (requires user interaction for audio)
  video = createCapture(VIDEO);
  video.size(80, 60);
  video.hide();

  // Resume audio context
  getAudioContext().resume();

  // Hide button
  document.getElementById('start-btn').classList.add('hidden');
  started = true;
}

function draw() {
  background(0);

  if (!started || !video) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(20);
    text('Click to start', width / 2, height / 2);
    return;
  }

  video.loadPixels();

  if (video.pixels.length === 0) return;

  // Draw pixelated video
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      // Mirror horizontally
      let vx = floor(map(cols - 1 - i, 0, cols, 0, video.width));
      let vy = floor(map(j, 0, rows, 0, video.height));

      let index = (vx + vy * video.width) * 4;
      let r = video.pixels[index];
      let g = video.pixels[index + 1];
      let b = video.pixels[index + 2];

      fill(r, g, b);
      rect(i * videoScale, j * videoScale, videoScale, videoScale);
    }
  }

  // Check colors at sample points and trigger sounds
  for (let i = 0; i < samplePoints.length; i++) {
    let px = floor(samplePoints[i].x * width);
    let py = floor(samplePoints[i].y * height);

    // Draw sample point indicator
    stroke(255);
    noFill();
    ellipse(px, py, 10, 10);
    noStroke();

    // Get color at this point
    let c = get(px, py);
    let h = hue(c);

    // Trigger sounds based on hue
    let now = millis();
    if (now - lastTrigger[i] > COOLDOWN) {
      if (h >= 0 && h < 15) {
        // Red
        triggerSound(redSound, i);
      } else if (h >= 50 && h < 70) {
        // Yellow
        triggerSound(yellowSound, i);
      } else if (h >= 90 && h < 150) {
        // Green
        triggerSound(greenSound, i);
      } else if (h >= 180 && h < 250) {
        // Blue
        triggerSound(blueSound, i);
      } else if (h >= 270 && h < 290) {
        // Purple
        triggerSound(purpleSound, i);
      } else if (h >= 310 && h < 345) {
        // Pink
        triggerSound(pinkSound, i);
      }
    }
  }
}

function triggerSound(sound, pointIndex) {
  if (sound && sound.isLoaded()) {
    // Play from beginning if already playing
    if (sound.isPlaying()) {
      sound.stop();
    }
    sound.play();
    lastTrigger[pointIndex] = millis();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = floor(width / videoScale);
  rows = floor(height / videoScale);
}
