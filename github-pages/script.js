const portal = document.querySelector('#portal');
const enterButton = document.querySelector('#enter');
const soundButton = document.querySelector('#sound');
const soundLabel = soundButton.querySelector('.sound__label');
const finale = document.querySelector('#finale');
const receiveButton = document.querySelector('#receive');
const finalAfter = document.querySelector('#final-after');
const petals = document.querySelector('#petals');

let audioContext;
let masterGain;
let delayNode;
let feedbackGain;
let musicTimer;
let chordIndex = 0;
let isMusicOn = false;

const chords = [
  [261.63, 329.63, 392.0],
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [196.0, 246.94, 293.66],
];
const melodies = [523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0, 493.88];

function prepareAudio() {
  if (audioContext) return;
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;

  audioContext = new AudioEngine();
  masterGain = audioContext.createGain();
  delayNode = audioContext.createDelay(2.2);
  feedbackGain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  masterGain.gain.value = 0.0001;
  delayNode.delayTime.value = 0.42;
  feedbackGain.gain.value = 0.22;
  filter.type = 'lowpass';
  filter.frequency.value = 2300;

  masterGain.connect(filter);
  filter.connect(audioContext.destination);
  filter.connect(delayNode);
  delayNode.connect(feedbackGain);
  feedbackGain.connect(delayNode);
  delayNode.connect(audioContext.destination);
}

function makeTone(frequency, start, duration, volume, type = 'sine') {
  if (!audioContext || !masterGain) return;
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.detune.setValueAtTime((Math.random() - 0.5) * 5, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(volume, start + Math.min(.55, duration * .25));
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope);
  envelope.connect(masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + .1);
}

function scheduleMusic() {
  if (!audioContext || !isMusicOn) return;
  const now = audioContext.currentTime + .08;
  const chord = chords[chordIndex % chords.length];
  chord.forEach((note, index) => makeTone(note / 2, now + index * .07, 6.4, .12, index === 1 ? 'triangle' : 'sine'));

  for (let beat = 0; beat < 4; beat += 1) {
    const note = melodies[(chordIndex * 2 + beat) % melodies.length];
    makeTone(note, now + .45 + beat * 1.02, 1.65, .08, 'sine');
  }
  chordIndex += 1;
}

async function startMusic() {
  prepareAudio();
  if (!audioContext) {
    soundLabel.textContent = '浏览祝福';
    return;
  }
  await audioContext.resume();
  isMusicOn = true;
  masterGain.gain.cancelScheduledValues(audioContext.currentTime);
  masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, .0001), audioContext.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(.075, audioContext.currentTime + 1.1);
  scheduleMusic();
  clearInterval(musicTimer);
  musicTimer = window.setInterval(scheduleMusic, 4200);
  soundButton.classList.remove('is-muted');
  soundButton.setAttribute('aria-label', '暂停背景音乐');
  soundLabel.textContent = '佳音播放中';
}

function pauseMusic() {
  if (!audioContext) return;
  isMusicOn = false;
  clearInterval(musicTimer);
  masterGain.gain.cancelScheduledValues(audioContext.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .55);
  soundButton.classList.add('is-muted');
  soundButton.setAttribute('aria-label', '播放背景音乐');
  soundLabel.textContent = '佳音已暂停';
}

function playFinalChime() {
  if (!isMusicOn || !audioContext) return;
  const start = audioContext.currentTime + .05;
  [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
    makeTone(note, start + index * .18, 2.2, .16, 'sine');
  });
}

enterButton.addEventListener('click', async () => {
  await startMusic();
  portal.classList.add('is-open');
  document.body.classList.remove('is-locked');
  soundButton.hidden = false;
});

soundButton.addEventListener('click', () => {
  if (isMusicOn) pauseMusic();
  else startMusic();
});

// Elements reveal only when their chapter reaches the listener.
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .13, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('.reveal, .reveal-image').forEach((element) => observer.observe(element));

// A small, bounded parallax layer keeps the supplied photographs alive on touch screens.
const parallaxItems = [...document.querySelectorAll('[data-parallax]')];
let framePending = false;
function updateParallax() {
  const viewportCenter = window.innerHeight / 2;
  parallaxItems.forEach((element) => {
    const rect = element.parentElement.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > window.innerHeight + 120) return;
    const rate = Number(element.dataset.parallax || 0);
    const offset = Math.max(-55, Math.min(55, (rect.top + rect.height / 2 - viewportCenter) * rate));
    const scale = element.classList.contains('hero__photo') ? 1.08 : 1.12;
    element.style.transform = `translate3d(0, ${offset}px, 0) scale(${scale})`;
  });
  framePending = false;
}
window.addEventListener('scroll', () => {
  if (!framePending) {
    framePending = true;
    requestAnimationFrame(updateParallax);
  }
}, { passive: true });
updateParallax();

function releasePetals() {
  petals.replaceChildren();
  const colors = ['#e7bd74', '#ed9ead', '#c9eef2', '#f7f2e8'];
  for (let index = 0; index < 76; index += 1) {
    const petal = document.createElement('i');
    petal.style.setProperty('--x', `${(index * 47) % 101}%`);
    petal.style.setProperty('--size', `${7 + (index % 6) * 2}px`);
    petal.style.setProperty('--color', colors[index % colors.length]);
    petal.style.setProperty('--duration', `${4.2 + (index % 8) * .3}s`);
    petal.style.setProperty('--delay', `${(index % 14) * .08}s`);
    petal.style.setProperty('--drift', `${((index * 29) % 180) - 90}px`);
    petal.style.setProperty('--rotate', `${360 + (index % 5) * 160}deg`);
    petals.append(petal);
  }
}

receiveButton.addEventListener('click', () => {
  finale.classList.add('has-arrived');
  receiveButton.querySelector('span').textContent = '佳音已抵达';
  finalAfter.textContent = '愿朱佳音，岁岁有回应，年年有佳音。';
  releasePetals();
  playFinalChime();
});

// Slow luminous dust across the whole page.
const canvas = document.querySelector('#ambient');
const context = canvas.getContext('2d');
let particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth * ratio;
  canvas.height = canvasHeight * ratio;
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: Math.min(38, Math.max(20, Math.round(canvasWidth / 24))) }, (_, index) => ({
    x: (index * 73) % canvasWidth,
    y: (index * 137) % canvasHeight,
    radius: .5 + (index % 4) * .45,
    speed: .08 + (index % 5) * .025,
    phase: index * .73,
  }));
}
function paintAmbient(time = 0) {
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  particles.forEach((particle) => {
    particle.y -= particle.speed;
    if (particle.y < -8) particle.y = canvasHeight + 8;
    const x = particle.x + Math.sin(time * .00035 + particle.phase) * 13;
    context.beginPath();
    context.arc(x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(194, 238, 243, ${.15 + particle.radius * .11})`;
    context.shadowColor = '#bfeef2';
    context.shadowBlur = 8;
    context.fill();
  });
  requestAnimationFrame(paintAmbient);
}
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas();
requestAnimationFrame(paintAmbient);
