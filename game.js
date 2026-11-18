// Step 1: draw the row of tower cupboards.
var canvas = document.getElementById('stage');
var ctx = canvas.getContext('2d');

var COUNT = 5; // how many cupboards in my row
var woods = ['#8a5a36', '#7b4f2e', '#9a6840', '#6f4528', '#8f5f3a'];

function drawCupboard(x, y, w, h, color) {
  // the body
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  // dark frame
  ctx.strokeStyle = '#3b2412';
  ctx.lineWidth = 5;
  ctx.strokeRect(x, y, w, h);
  // two door panels
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

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // stone floor
  ctx.fillStyle = '#4a4670';
  ctx.fillRect(0, 340, canvas.width, 60);
  var gap = 24;
  var w = (canvas.width - gap * (COUNT + 1)) / COUNT;
  var h = 260;
  for (var i = 0; i < COUNT; i++) {
    drawCupboard(gap + i * (w + gap), 340 - h, w, h, woods[i % woods.length]);
  }
}

draw();
