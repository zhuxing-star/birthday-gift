const birthday = new Date('2026-10-28T00:00:00+08:00');
const countdownNodes = {
  days: document.querySelector('#days'), hours: document.querySelector('#hours'),
  minutes: document.querySelector('#minutes'), seconds: document.querySelector('#seconds'),
};
const countdownCaption = document.querySelector('#countdown-caption');
const openInvitation = document.querySelector('#open-invitation');
const soundButton = document.querySelector('#sound');
const soundText = soundButton.querySelector('.sound__text');
const jellyButtons = [...document.querySelectorAll('.jelly')];
const litCount = document.querySelector('#lit-count');
const ritualStage = document.querySelector('#ritual-stage');
const ritualComplete = document.querySelector('#ritual-complete');
const revealGift = document.querySelector('#reveal-gift');

function updateCountdown() {
  const remaining = birthday.getTime() - Date.now();
  if (remaining <= 0) {
    Object.values(countdownNodes).forEach((node) => { node.textContent = '00'; });
    countdownCaption.textContent = '今天，祝朱佳音生日快乐';
    return;
  }
  const day = 86400000;
  const hour = 3600000;
  const minute = 60000;
  countdownNodes.days.textContent = String(Math.floor(remaining / day)).padStart(2, '0');
  countdownNodes.hours.textContent = String(Math.floor((remaining % day) / hour)).padStart(2, '0');
  countdownNodes.minutes.textContent = String(Math.floor((remaining % hour) / minute)).padStart(2, '0');
  countdownNodes.seconds.textContent = String(Math.floor((remaining % minute) / 1000)).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

let audioContext;
let masterGain;
let ambientTimer;
let birthdayTimer;
let musicMode = 'ambient';
let isMusicOn = false;
let ambientStep = 0;

function setupAudio() {
  if (audioContext) return;
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  audioContext = new AudioEngine();
  masterGain = audioContext.createGain();
  const lowpass = audioContext.createBiquadFilter();
  const delay = audioContext.createDelay(2);
  const feedback = audioContext.createGain();
  masterGain.gain.value = 0.0001;
  lowpass.type = 'lowpass'; lowpass.frequency.value = 2600;
  delay.delayTime.value = 0.34; feedback.gain.value = 0.2;
  masterGain.connect(lowpass); lowpass.connect(audioContext.destination); lowpass.connect(delay);
  delay.connect(feedback); feedback.connect(delay); delay.connect(audioContext.destination);
}

function tone(frequency, start, duration, volume, type = 'sine') {
  if (!audioContext || !masterGain) return;
  const oscillator = audioContext.createOscillator();
  const envelope = audioContext.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.08, duration * 0.2));
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(envelope); envelope.connect(masterGain);
  oscillator.start(start); oscillator.stop(start + duration + 0.05);
}

const ambientChords = [[130.81,196,261.63],[110,164.81,220],[146.83,220,293.66],[98,146.83,196]];
function playAmbientPhrase() {
  if (!isMusicOn || musicMode !== 'ambient') return;
  const now = audioContext.currentTime + 0.05;
  const chord = ambientChords[ambientStep % ambientChords.length];
  chord.forEach((note, index) => tone(note, now + index * 0.08, 5.6, 0.08, index === 1 ? 'triangle' : 'sine'));
  tone(chord[2] * 2, now + 1.4, 1.8, 0.045); tone(chord[1] * 2, now + 3.2, 1.5, 0.038);
  ambientStep += 1;
}

const birthdayNotes = [
  [392,.38],[392,.2],[440,.62],[392,.62],[523.25,.62],[493.88,1.2],
  [392,.38],[392,.2],[440,.62],[392,.62],[587.33,.62],[523.25,1.2],
  [392,.38],[392,.2],[783.99,.62],[659.25,.62],[523.25,.62],[493.88,.62],[440,1.2],
  [698.46,.38],[698.46,.2],[659.25,.62],[523.25,.62],[587.33,.62],[523.25,1.3],
];
function playBirthdaySong() {
  if (!isMusicOn || musicMode !== 'birthday') return;
  let cursor = audioContext.currentTime + 0.12;
  birthdayNotes.forEach(([note, duration]) => {
    tone(note, cursor, duration * 0.92, 0.12); tone(note * 2, cursor, duration * 0.55, 0.025, 'triangle');
    cursor += duration;
  });
}

async function startMusic() {
  setupAudio();
  if (!audioContext) return;
  await audioContext.resume(); isMusicOn = true;
  masterGain.gain.cancelScheduledValues(audioContext.currentTime);
  masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), audioContext.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.07, audioContext.currentTime + 0.8);
  clearInterval(ambientTimer); clearInterval(birthdayTimer);
  if (musicMode === 'ambient') { playAmbientPhrase(); ambientTimer = setInterval(playAmbientPhrase, 4800); }
  else { playBirthdaySong(); birthdayTimer = setInterval(playBirthdaySong, 15000); }
  soundButton.hidden = false; soundButton.classList.remove('is-muted');
  soundButton.setAttribute('aria-label', '暂停音乐'); soundText.textContent = musicMode === 'birthday' ? '生日歌' : '音乐';
}

function pauseMusic() {
  if (!audioContext) return;
  isMusicOn = false; clearInterval(ambientTimer); clearInterval(birthdayTimer);
  masterGain.gain.cancelScheduledValues(audioContext.currentTime);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.35);
  soundButton.classList.add('is-muted'); soundButton.setAttribute('aria-label', '播放音乐'); soundText.textContent = '已暂停';
}

function switchToBirthdaySong() {
  musicMode = 'birthday'; clearInterval(ambientTimer);
  if (isMusicOn) { playBirthdaySong(); birthdayTimer = setInterval(playBirthdaySong, 15000); soundText.textContent = '生日歌'; }
}

openInvitation.addEventListener('click', async () => {
  await startMusic(); document.querySelector('#journey').scrollIntoView({ behavior: 'smooth' });
});
soundButton.addEventListener('click', () => { if (isMusicOn) pauseMusic(); else startMusic(); });

let lights = 0;
jellyButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (button.classList.contains('is-lit')) return;
    if (!audioContext) await startMusic();
    button.classList.add('is-lit'); lights += 1; litCount.textContent = String(lights);
    if (audioContext && isMusicOn) tone([523.25,587.33,659.25,783.99,880][lights - 1], audioContext.currentTime + 0.03, 1.4, 0.1);
    if (lights === jellyButtons.length) {
      ritualStage.classList.add('is-complete'); ritualComplete.classList.add('is-visible');
      setTimeout(switchToBirthdaySong, 650);
    }
  });
});
revealGift.addEventListener('click', () => document.querySelector('#finale').scrollIntoView({ behavior: 'smooth' }));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal, .reveal-image').forEach((element) => revealObserver.observe(element));

const canvas = document.querySelector('#ambient');
const context = canvas.getContext('2d');
let particles = []; let width = 0; let height = 0;
function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = width * ratio; canvas.height = height * ratio;
  canvas.style.width = `${width}px`; canvas.style.height = `${height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  particles = Array.from({ length: Math.min(42, Math.max(20, Math.round(width / 22))) }, (_, index) => ({
    x: (index * 83) % width, y: (index * 149) % height, radius: 0.6 + (index % 4) * 0.55,
    speed: 0.12 + (index % 5) * 0.035, phase: index * 0.71,
  }));
}
function drawAmbient(time = 0) {
  context.clearRect(0, 0, width, height);
  particles.forEach((particle) => {
    particle.y -= particle.speed; if (particle.y < -10) particle.y = height + 10;
    const x = particle.x + Math.sin(time * 0.0004 + particle.phase) * 12;
    context.beginPath(); context.arc(x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(175,231,244,${0.12 + particle.radius * 0.08})`; context.fill();
  });
  requestAnimationFrame(drawAmbient);
}
window.addEventListener('resize', resizeCanvas, { passive: true });
resizeCanvas(); requestAnimationFrame(drawAmbient);
