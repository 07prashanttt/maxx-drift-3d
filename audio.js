let soundOn = true;
let actx = null;

function ensureCtx() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
}

function toggleAudio() {
  soundOn = !soundOn;
  document.getElementById('muteBtn').textContent = soundOn ? '🔊' : '🔇';
  if (soundOn) playTone(640, 0.08, 'sine', 0.06);
}

function playTone(freq = 520, dur = 0.09, type = 'triangle', vol = 0.06) {
  if (!soundOn) return;
  ensureCtx();
  const osc = actx.createOscillator();
  const gain = actx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, actx.currentTime);
  gain.gain.setValueAtTime(vol, actx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
  osc.connect(gain);
  gain.connect(actx.destination);
  osc.start();
  osc.stop(actx.currentTime + dur);
}

function playCorePickup() {
  playTone(760, 0.08, 'sine', 0.08);
  setTimeout(() => playTone(1040, 0.11, 'triangle', 0.07), 55);
}

function playBoostPulse() {
  playTone(220, 0.14, 'sawtooth', 0.04);
}
