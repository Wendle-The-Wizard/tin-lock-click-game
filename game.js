// Step 5: a small glow when a cupboard opens.
var canvas = document.getElementById('stage');
var ctx = canvas.getContext('2d');
var statusEl = document.getElementById('status');
var soundBtn = document.getElementById('soundBtn');
var soundNote = document.getElementById('soundNote');
var againBtn = document.getElementById('again');

var COUNT = 5;
var woods = ['#8a5a36', '#7b4f2e', '#9a6840', '#6f4528', '#8f5f3a'];
var gap = 24;
var cw = (canvas.width - gap * (COUNT + 1)) / COUNT;
var ch = 260;
// the browser owns the name "top", so I use topY
var topY = 340 - ch;

var rightOne = Math.floor(Math.random() * COUNT);
var opened = -1;
var openedAt = 0; // when it opened, for the glow
var tries = 0;
var soundOn = true;
var sparks = [];

var key = { x: canvas.width / 2, y: 250 };
var target = { x: key.x, y: key.y };

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
  if (!soundOn) return;
  var a = getAudio();
  if (!a) return;
  var t = a.currentTime;
  var master = a.createGain();
  master.gain.value = 0.5;
  master.connect(a.destination);
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

// the glow: a warm pulsing light around the opened cupboard, plus little sparks
function drawGlow() {
  if (opened < 0) return;
  var p = lockPos(opened);
  var age = (performance.now() - openedAt) / 1000;
  var pulse = 0.75 + 0.25 * Math.sin(age * 3);
  var burst = Math.max(0, 1 - age / 0.6); // extra flash at the start
  var r = 90 + burst * 50;
  var g = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, r);
  g.addColorStop(0, 'rgba(255,240,160,' + (0.85 * pulse) + ')');
  g.addColorStop(1, 'rgba(255,200,80,0)');
  ctx.fillStyle = g;
  ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
  for (var i = sparks.length - 1; i >= 0; i--) {
    var s = sparks[i];
    s.x += s.vx; s.y += s.vy; s.life -= 0.02;
    if (s.life <= 0) { sparks.splice(i, 1); continue; }
    ctx.fillStyle = 'rgba(255,240,170,' + s.life + ')';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 3 * s.life + 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

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
  drawGlow();
  drawKey(key.x, key.y);
}

function aim(e) {
  var r = canvas.getBoundingClientRect();
  target.x = (e.clientX - r.left) * canvas.width / r.width;
  target.y = (e.clientY - r.top) * canvas.height / r.height;
}
canvas.addEventListener('pointermove', aim);

function tryLock() {
  var i = nearLock();
  if (i < 0) {
    statusEl.textContent = 'The key is not at a lock. Line the tip up with a keyhole!';
    return;
  }
  if (opened === i) {
    statusEl.textContent = 'Cupboard ' + (i + 1) + ' is already open.';
    return;
  }
  if (opened >= 0) {
    statusEl.textContent = 'I already found the right one! Press New game to hide it again.';
    return;
  }
  tries++;
  if (i === rightOne) {
    opened = i;
    openedAt = performance.now();
    var p = lockPos(i);
    for (var k = 0; k < 24; k++) {
      var ang = Math.random() * Math.PI * 2, sp = 0.5 + Math.random() * 2;
      sparks.push({ x: p.x, y: p.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 0.4, life: 1 });
    }
    playClick();
    statusEl.textContent = 'Cupboard ' + (i + 1) + ': it fits! Click! It glows! (after ' + tries + ' tries)';
    soundNote.textContent = soundOn ? 'Sound: click played!' : 'Sound is off, so the click was silent.';
  } else {
    statusEl.textContent = 'Cupboard ' + (i + 1) + ': the key does not fit.';
  }
}

canvas.addEventListener('pointerdown', function (e) {
  aim(e);
  key.x = target.x; key.y = target.y;
  if (soundOn && getAudio()) soundNote.textContent = 'Sound: ready';
  tryLock();
});

soundBtn.addEventListener('click', function () {
  soundOn = !soundOn;
  soundBtn.textContent = 'Sound: ' + (soundOn ? 'on' : 'off');
  if (soundOn) { getAudio(); playClick(); soundNote.textContent = 'Sound: on (that was a test click)'; }
  else soundNote.textContent = 'Sound: off';
});

againBtn.addEventListener('click', function () {
  rightOne = Math.floor(Math.random() * COUNT);
  opened = -1; tries = 0; sparks = [];
  statusEl.textContent = 'A new lock is hiding the secret. Try the key!';
});

function loop() {
  key.x += (target.x - key.x) * 0.35;
  key.y += (target.y - key.y) * 0.35;
  draw();
  requestAnimationFrame(loop);
}
loop();
