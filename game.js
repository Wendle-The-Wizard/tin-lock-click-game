// Step 4: a soft click sound when the key fits.
var canvas = document.getElementById('stage');
var ctx = canvas.getContext('2d');
var statusEl = document.getElementById('status');

var COUNT = 5; // cupboards in my row
var woods = ['#8a5a36', '#7b4f2e', '#9a6840', '#6f4528', '#8f5f3a'];
var gap = 24;
var cw = (canvas.width - gap * (COUNT + 1)) / COUNT;
var ch = 260;
// Oops lesson: I used to call this "top", but the browser already owns that name!
var topY = 340 - ch;

// the secret: one cupboard is the right one
var rightOne = Math.floor(Math.random() * COUNT);
var opened = -1;
var tries = 0;

var key = { x: canvas.width / 2, y: 250 };
var target = { x: key.x, y: key.y };

// ---- sound: a soft click made from a tiny noise burst and a low blip ----
var audio = null;
function getAudio() {
  if (!audio) {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audio = new AC();
  }
  if (audio && audio.state === 'suspended') audio.resume();
  return audio;
}

function playClick() {
  var a = getAudio();
  if (!a) return;
  var t = a.currentTime;
  var master = a.createGain();
  master.gain.value = 0.5;
  master.connect(a.destination);

  // short burst of noise, filtered so it is soft not sharp
  var len = Math.floor(a.sampleRate * 0.04);
  var buf = a.createBuffer(1, len, a.sampleRate);
  var d = buf.getChannelData(0);
  for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  var noise = a.createBufferSource();
  noise.buffer = buf;
  var filt = a.createBiquadFilter();
  filt.type = 'bandpass';
  filt.frequency.value = 1800;
  var ng = a.createGain();
  ng.gain.setValueAtTime(0.6, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  noise.connect(filt); filt.connect(ng); ng.connect(master);
  noise.start(t);

  // low little blip, the "tock" of the bolt
  var o = a.createOscillator();
  o.type = 'sine';
  o.frequency.setValueAtTime(420, t);
  o.frequency.exponentialRampToValueAtTime(180, t + 0.08);
  var og = a.createGain();
  og.gain.setValueAtTime(0.5, t);
  og.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  o.connect(og); og.connect(master);
  o.start(t);
  o.stop(t + 0.12);
}

function lockPos(i) {
  return { x: gap + i * (cw + gap) + cw / 2, y: topY + ch / 2 };
}

// which lock is the key tip near? returns -1 if none
function nearLock() {
  for (var i = 0; i < COUNT; i++) {
    var p = lockPos(i);
    var dx = key.x - p.x, dy = key.y - p.y;
    if (Math.sqrt(dx * dx + dy * dy) < 26) return i;
  }
  return -1;
}

function drawCupboard(i, hot) {
  var x = gap + i * (cw + gap), y = topY, w = cw, h = ch;
  ctx.fillStyle = woods[i % woods.length];
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#3b2412';
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 10, y + 12, w - 20, h / 2 - 16);
  ctx.strokeRect(x + 10, y + h / 2 + 4, w - 20, h / 2 - 16);
  var p = lockPos(i);
  ctx.fillStyle = (opened === i) ? '#e8f0d0' : '#b9c2cc';
  ctx.beginPath();
  ctx.arc(p.x, p.y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = hot ? '#ffe27a' : '#6b7480';
  ctx.lineWidth = hot ? 4 : 2;
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(p.x, p.y - 3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(p.x - 1.5, p.y - 3, 3, 12);
}

// the brass key, tip up
function drawKey(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1.3, 1.3);
  ctx.fillStyle = '#d9a63a';
  ctx.strokeStyle = '#7a5a12';
  ctx.lineWidth = 2;
  ctx.fillRect(-3, 0, 6, 40);
  ctx.strokeRect(-3, 0, 6, 40);
  ctx.fillRect(3, 6, 9, 5);
  ctx.fillRect(3, 16, 6, 5);
  ctx.beginPath();
  ctx.arc(0, 52, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2c2850';
  ctx.beginPath();
  ctx.arc(0, 52, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#4a4670';
  ctx.fillRect(0, 340, canvas.width, 60);
  var near = nearLock();
  for (var i = 0; i < COUNT; i++) drawCupboard(i, i === near);
  drawKey(key.x, key.y);
}

// pointer position -> canvas coordinates (canvas is scaled by CSS)
function aim(e) {
  var r = canvas.getBoundingClientRect();
  target.x = (e.clientX - r.left) * canvas.width / r.width;
  target.y = (e.clientY - r.top) * canvas.height / r.height;
}
canvas.addEventListener('pointermove', aim);

canvas.addEventListener('pointerdown', function (e) {
  aim(e);
  getAudio(); // wake the sound up on the first tap
  key.x = target.x; key.y = target.y;
  var i = nearLock();
  if (i < 0) {
    statusEl.textContent = 'The key is not at a lock. Line the tip up with a keyhole!';
    return;
  }
  if (opened === i) {
    statusEl.textContent = 'Cupboard ' + (i + 1) + ' is already open.';
    return;
  }
  tries++;
  if (i === rightOne) {
    opened = i;
    playClick();
    statusEl.textContent = 'Cupboard ' + (i + 1) + ': it fits! Click! (after ' + tries + ' tries)';
  } else {
    statusEl.textContent = 'Cupboard ' + (i + 1) + ': the key does not fit.';
  }
});

function loop() {
  key.x += (target.x - key.x) * 0.35;
  key.y += (target.y - key.y) * 0.35;
  draw();
  requestAnimationFrame(loop);
}
loop();
