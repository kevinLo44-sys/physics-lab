const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const inputs = {
  v0: document.getElementById('v0'),
  angle: document.getElementById('angle'),
  g: document.getElementById('g'),
  drag: document.getElementById('drag'),
};

const displays = {
  v0: document.getElementById('v0-val'),
  angle: document.getElementById('angle-val'),
  g: document.getElementById('g-val'),
  drag: document.getElementById('drag-val'),
  range: document.getElementById('range'),
  maxH: document.getElementById('maxH'),
  time: document.getElementById('time'),
  finalV: document.getElementById('finalV'),
};

function calculateTrajectory(v0, angleDeg, g, drag) {
  const rad = (angleDeg * Math.PI) / 180;
  let x = 0, y = 0;
  let vx = v0 * Math.cos(rad);
  let vy = v0 * Math.sin(rad);
  const points = [];
  const dt = 0.02;
  let t = 0;

  while (y >= 0 || points.length === 0) {
    points.push({ x, y, vx, vy, t });
    const speed = Math.hypot(vx, vy);
    const d = drag * speed;
    vx += -d * vx * dt;
    vy += (-g - d * vy) * dt;
    x += vx * dt;
    y += vy * dt;
    t += dt;
    if (points.length > 2500) break;
  }
  return points;
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function draw(points) {
  const w = canvas.getBoundingClientRect().width;
  const h = canvas.getBoundingClientRect().height;

  ctx.clearRect(0, 0, w, h);

  if (points.length === 0) return;

  const maxX = Math.max(...points.map(p => p.x), 1);
  const maxY = Math.max(...points.map(p => p.y), 1);
  const pad = 40;
  const scale = Math.min((w - pad * 2) / maxX, (h - pad * 2) / maxY);

  const toC = (x, y) => ({
    cx: pad + x * scale,
    cy: h - pad - y * scale,
  });

  // Ground
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, h - pad);
  ctx.lineTo(w - 20, h - pad);
  ctx.stroke();

  // Trajectory
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  points.forEach((p, i) => {
    const { cx, cy } = toC(p.x, p.y);
    if (i === 0) ctx.moveTo(cx, cy);
    else ctx.lineTo(cx, cy);
  });
  ctx.stroke();

  // Start point
  const start = toC(0, 0);
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.arc(start.cx, start.cy, 6, 0, Math.PI * 2);
  ctx.fill();

  // End point (projectile)
  const end = points[points.length - 1];
  const endC = toC(end.x, end.y);
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(endC.cx, endC.cy, 7, 0, Math.PI * 2);
  ctx.fill();
}

function update() {
  const v0 = parseFloat(inputs.v0.value);
  const angle = parseFloat(inputs.angle.value);
  const g = parseFloat(inputs.g.value);
  const drag = parseFloat(inputs.drag.value);

  displays.v0.textContent = `${v0.toFixed(1)} m/s`;
  displays.angle.textContent = `${angle.toFixed(0)}°`;
  displays.g.textContent = `${g.toFixed(2)} m/s²`;
  displays.drag.textContent = drag.toFixed(3);

  const points = calculateTrajectory(v0, angle, g, drag);
  draw(points);

  const last = points[points.length - 1];
  const maxHeight = Math.max(...points.map(p => p.y));
  const finalSpeed = Math.hypot(last.vx, last.vy);

  displays.range.textContent = `${last.x.toFixed(1)} m`;
  displays.maxH.textContent = `${maxHeight.toFixed(1)} m`;
  displays.time.textContent = `${last.t.toFixed(2)} s`;
  displays.finalV.textContent = `${finalSpeed.toFixed(1)} m/s`;
}

// Event listeners
Object.values(inputs).forEach(input => {
  input.addEventListener('input', update);
});

window.addEventListener('resize', () => {
  resizeCanvas();
  update();
});

// Init
resizeCanvas();
update();
