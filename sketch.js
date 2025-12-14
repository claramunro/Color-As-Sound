// Color As Sound - p5.js version
// Each pixel's color is converted into sound
// Two sound packs: Original (samples) and Instruments (synthesized)

let video;
let videoScale = 20;
let cols, rows;
let started = false;

// Current sound pack
let currentPack = 'instruments';

// Original sound samples
let originalSounds = {};

// Synthesized instruments
let synths = {};

// Sample points for color detection
let samplePoints = [];

// Cooldown to prevent sound spam
let lastTrigger = {};
const COOLDOWN = 150;

function preload() {
  soundFormats('mp3', 'wav');
  originalSounds.red = loadSound('cinco.mp3');
  originalSounds.green = loadSound('dope2_converted.wav');
  originalSounds.blue = loadSound('Dusty_Mirror.wav');
  originalSounds.purple = loadSound('Dusty_Mirror.wav');
  originalSounds.yellow = loadSound('123.wav');
  originalSounds.pink = loadSound('Lounge_Vibes.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100);
  noStroke();
  frameRate(20);

  cols = floor(width / videoScale);
  rows = floor(height / videoScale);

  // Define sample points
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

  // Set up buttons
  document.getElementById('start-btn').addEventListener('click', startExperience);

  document.querySelectorAll('.sound-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPack = btn.dataset.pack;
    });
  });
}

function startExperience() {
  video = createCapture(VIDEO);
  video.size(80, 60);
  video.hide();

  getAudioContext().resume();

  // Create synthesized instruments
  createSynths();

  document.getElementById('start-btn').classList.add('hidden');
  document.getElementById('controls').classList.remove('hidden');
  started = true;
}

function createSynths() {
  // Hi-hat (noise burst) - for red
  synths.hihat = {
    play: function () {
      let env = new p5.Envelope();
      env.setADSR(0.001, 0.05, 0.0, 0.05);
      env.setRange(0.3, 0);
      let noise = new p5.Noise('white');
      noise.amp(env);
      noise.start();
      env.play();
      setTimeout(() => noise.stop(), 100);
    }
  };

  // Kick drum (low sine with pitch drop) - for yellow
  synths.kick = {
    play: function () {
      let osc = new p5.Oscillator('sine');
      let env = new p5.Envelope();
      env.setADSR(0.001, 0.2, 0.0, 0.1);
      env.setRange(0.5, 0);
      osc.freq(150);
      osc.amp(env);
      osc.start();
      env.play();
      // Pitch drop
      osc.freq(150, 0);
      osc.freq(50, 0.1);
      setTimeout(() => osc.stop(), 300);
    }
  };

  // Bass synth (saw wave) - for green
  synths.bass = {
    play: function () {
      let osc = new p5.Oscillator('sawtooth');
      let env = new p5.Envelope();
      env.setADSR(0.01, 0.1, 0.3, 0.2);
      env.setRange(0.3, 0);
      osc.freq(55); // Low A
      osc.amp(env);
      osc.start();
      env.play();
      setTimeout(() => osc.stop(), 400);
    }
  };

  // Synth pad (triangle wave) - for blue
  synths.pad = {
    play: function () {
      let osc = new p5.Oscillator('triangle');
      let env = new p5.Envelope();
      env.setADSR(0.05, 0.1, 0.4, 0.3);
      env.setRange(0.2, 0);
      osc.freq(220); // A3
      osc.amp(env);
      osc.start();
      env.play();
      setTimeout(() => osc.stop(), 500);
    }
  };

  // Piano-ish (sine with harmonics) - for purple
  synths.piano = {
    play: function () {
      let osc1 = new p5.Oscillator('sine');
      let osc2 = new p5.Oscillator('sine');
      let env = new p5.Envelope();
      env.setADSR(0.01, 0.3, 0.1, 0.2);
      env.setRange(0.25, 0);
      osc1.freq(262); // C4
      osc2.freq(524); // C5 (octave)
      osc1.amp(env);
      osc2.amp(0.1);
      osc1.start();
      osc2.start();
      env.play();
      setTimeout(() => { osc1.stop(); osc2.stop(); }, 500);
    }
  };

  // Snare (noise + tone) - for pink
  synths.snare = {
    play: function () {
      let noise = new p5.Noise('pink');
      let osc = new p5.Oscillator('triangle');
      let envNoise = new p5.Envelope();
      let envTone = new p5.Envelope();
      envNoise.setADSR(0.001, 0.1, 0.0, 0.1);
      envNoise.setRange(0.3, 0);
      envTone.setADSR(0.001, 0.05, 0.0, 0.05);
      envTone.setRange(0.2, 0);
      noise.amp(envNoise);
      osc.freq(180);
      osc.amp(envTone);
      noise.start();
      osc.start();
      envNoise.play();
      envTone.play();
      setTimeout(() => { noise.stop(); osc.stop(); }, 200);
    }
  };
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

  // Check colors and trigger sounds
  for (let i = 0; i < samplePoints.length; i++) {
    let px = floor(samplePoints[i].x * width);
    let py = floor(samplePoints[i].y * height);

    stroke(255);
    noFill();
    ellipse(px, py, 10, 10);
    noStroke();

    let c = get(px, py);
    let h = hue(c);

    let now = millis();
    if (now - lastTrigger[i] > COOLDOWN) {
      triggerByHue(h, i);
    }
  }
}

function triggerByHue(h, pointIndex) {
  let triggered = false;

  if (h >= 0 && h < 15) {
    // Red
    if (currentPack === 'original') {
      playOriginal('red');
    } else {
      synths.hihat.play();
    }
    triggered = true;
  } else if (h >= 50 && h < 70) {
    // Yellow
    if (currentPack === 'original') {
      playOriginal('yellow');
    } else {
      synths.kick.play();
    }
    triggered = true;
  } else if (h >= 90 && h < 150) {
    // Green
    if (currentPack === 'original') {
      playOriginal('green');
    } else {
      synths.bass.play();
    }
    triggered = true;
  } else if (h >= 180 && h < 250) {
    // Blue
    if (currentPack === 'original') {
      playOriginal('blue');
    } else {
      synths.pad.play();
    }
    triggered = true;
  } else if (h >= 270 && h < 290) {
    // Purple
    if (currentPack === 'original') {
      playOriginal('purple');
    } else {
      synths.piano.play();
    }
    triggered = true;
  } else if (h >= 310 && h < 345) {
    // Pink
    if (currentPack === 'original') {
      playOriginal('pink');
    } else {
      synths.snare.play();
    }
    triggered = true;
  }

  if (triggered) {
    lastTrigger[pointIndex] = millis();
  }
}

function playOriginal(color) {
  let sound = originalSounds[color];
  if (sound && sound.isLoaded()) {
    if (sound.isPlaying()) {
      sound.stop();
    }
    sound.play();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cols = floor(width / videoScale);
  rows = floor(height / videoScale);
}
