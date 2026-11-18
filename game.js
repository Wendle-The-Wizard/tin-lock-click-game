// Step 2: the brass key follows the pointer.
var canvas = document.getElementById('stage');
var ctx = canvas.getContext('2d');

var COUNT = 5; // how many cupboards in my row
var woods = ['#8a5a36', '#7b4f2e', '#9a6840', '#6f4528', '#8f5f3a'];

// where the key is now, and where the pointer wants it
var key = { x: canvas.width / 2, y: 370 };
var target = { x: key.x, y: key.y };

function drawCupboard(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#3b2412';
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, w, h);
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 10, y + 12, w - 20, h / 2 - 16);
  ctx.strokeRect(x + 10, y + h / 2 + 4, w - 20, h / 2 - 16);
  // tin lock plate with a keyhole
  var cx = x + w / 2, cy = y + h / 2;
  ctx.fillStyle = '#b9c2cc';
  ctx.beginPath();
  ctx.arc(cx, cy, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6b7480';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(cx, cy - 3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(cx - 1.5, cy - 3, 3, 12);
}

// the brass key, tip pointing up so it can poke into a keyhole
function drawKey(x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#d9a63a';
  ctx.strokeStyle = '#7a5a12';
  ctx.lineWidth = 2;
  // shaft (tip at 0,0)
  ctx.fillRect(-3, 0, 6, 40);
  ctx.strokeRect(-3, 0, 6, 40);
  // teeth
  ctx.fillRect(3, 6, 9, 5);
  ctx.fillRect(3, 16, 6, 5);
  // round bow at the bottom
  ctx.beginPath();
  ctx.arc(0, 52, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // hole in the bow
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
  var gap = 24;
  var w = (canvas.width - gap * (COUNT + 1)) / COUNT;
  var h = 260;
  for (var i = 0; i < COUNT; i++) {
    drawCupboard(gap + i * (w + gap), 340 - h, w, h, woods[i % woods.length]);
  }
  drawKey(key.x, key.y);
}

// turn a pointer position into canvas coordinates (canvas is scaled by CSS)
function aim(e) {
  var r = canvas.getBoundingClientRect();
  target.x = (e.clientX - r.left) * canvas.width / r.width;
  target.y = (e.clientY - r.top) * canvas.height / r.height;
}
canvas.addEventListener('pointermove', aim);
canvas.addEventListener('pointerdown', aim);

// each frame the key slides a bit closer, so it feels smooth
function loop() {
  key.x += (target.x - key.x) * 0.35;
  key.y += (target.y - key.y) * 0.35;
  draw();
  requestAnimationFrame(loop);
}
loop();
