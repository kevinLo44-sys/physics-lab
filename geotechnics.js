function setupCanvas(id) {
  const c = document.getElementById(id);
  const ctx = c.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = c.getBoundingClientRect();
  c.width = rect.width * dpr;
  c.height = rect.height * dpr;
  ctx.scale(dpr, dpr);
  return { ctx, w: rect.width, h: rect.height };
}

function updateMohrCoulomb() {
  const c = +document.getElementById('mc-c').value;
  const phi = +document.getElementById('mc-phi').value;
  const sigma = +document.getElementById('mc-sigma').value;

  document.getElementById('mc-c-val').textContent = c + ' kPa';
  document.getElementById('mc-phi-val').textContent = phi + '°';
  document.getElementById('mc-sigma-val').textContent = sigma + ' kPa';

  const tau = c + sigma * Math.tan(phi * Math.PI / 180);
  document.getElementById('mc-result').innerHTML =
    `<strong>Shear strength τ = ${tau.toFixed(1)} kPa</strong><br>Failure plane ≈ ${(45 + phi/2).toFixed(1)}°`;

  const { ctx, w, h } = setupCanvas('mc-canvas');
  ctx.clearRect(0, 0, w, h);
  const maxS = 250, maxT = 180;
  const sx = (w - 50) / maxS, sy = (h - 50) / maxT;
  const ox = 40, oy = h - 30;

  ctx.strokeStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(ox, oy); ctx.lineTo(w - 10, oy);
  ctx.moveTo(ox, oy); ctx.lineTo(ox, 15);
  ctx.stroke();

  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let s = 0; s <= maxS; s += 4) {
    const t = c + s * Math.tan(phi * Math.PI / 180);
    const x = ox + s * sx;
    const y = oy - Math.min(t, maxT) * sy;
    if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const center = sigma + tau / Math.tan(Math.max(phi * Math.PI / 180, 0.05));
  const radius = Math.hypot(center - sigma, tau);
  if (radius > 0 && radius < maxS) {
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ox + center * sx, oy, radius * sx, Math.PI, 0, true);
    ctx.stroke();
  }

  const px = ox + sigma * sx;
  const py = oy - Math.min(tau, maxT) * sy;
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px system-ui';
  ctx.fillText('σ', w - 22, oy + 14);
  ctx.fillText('τ', ox - 18, 25);
}

function updateRankine() {
  const phi = +document.getElementById('rank-phi').value;
  const H = +document.getElementById('rank-h').value;
  const gamma = +document.getElementById('rank-g').value;

  document.getElementById('rank-phi-val').textContent = phi + '°';
  document.getElementById('rank-h-val').textContent = H + ' m';
  document.getElementById('rank-g-val').textContent = gamma + ' kN/m³';

  const rad = phi * Math.PI / 180;
  const Ka = Math.pow(Math.tan(Math.PI/4 - rad/2), 2);
  const Kp = Math.pow(Math.tan(Math.PI/4 + rad/2), 2);
  const Pa = 0.5 * Ka * gamma * H * H;

  document.getElementById('rank-result').innerHTML =
    `<strong>Ka = ${Ka.toFixed(3)}</strong> &nbsp; <strong>Kp = ${Kp.toFixed(2)}</strong><br>Pa ≈ ${Pa.toFixed(1)} kN/m (at H/3)`;

  const { ctx, w, h } = setupCanvas('rank-canvas');
  ctx.clearRect(0, 0, w, h);
  const wallX = 60, baseY = h - 30, topY = 30;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(wallX, topY); ctx.lineTo(wallX, baseY); ctx.stroke();
  const maxP = Ka * gamma * H;
  const scale = Math.min(80, (w - wallX - 40) / Math.max(maxP, 1));
  ctx.fillStyle = 'rgba(59,130,246,0.4)';
  ctx.beginPath();
  ctx.moveTo(wallX, topY);
  ctx.lineTo(wallX + maxP * scale, baseY);
  ctx.lineTo(wallX, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.stroke();
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '11px system-ui';
  ctx.fillText('Wall', wallX - 45, (topY + baseY)/2);
  ctx.fillText('Active pressure', wallX + 10, topY + 20);
}

function getNFactors(phi) {
  if (phi <= 0) return { Nc: 5.7, Nq: 1, Ng: 0 };
  const phiR = phi * Math.PI / 180;
  const Nq = Math.exp(Math.PI * Math.tan(phiR)) * Math.pow(Math.tan(Math.PI/4 + phiR/2), 2);
  const Nc = (Nq - 1) / Math.tan(phiR);
  const Ng = 2 * (Nq + 1) * Math.tan(phiR);
  return { Nc, Nq, Ng };
}

function updateBearing() {
  const c = +document.getElementById('bc-c').value;
  const phi = +document.getElementById('bc-phi').value;
  const B = +document.getElementById('bc-b').value;
  const Df = +document.getElementById('bc-df').value;
  const gamma = +document.getElementById('bc-g').value;

  document.getElementById('bc-c-val').textContent = c + ' kPa';
  document.getElementById('bc-phi-val').textContent = phi + '°';
  document.getElementById('bc-b-val').textContent = B + ' m';
  document.getElementById('bc-df-val').textContent = Df + ' m';
  document.getElementById('bc-g-val').textContent = gamma + ' kN/m³';

  const { Nc, Nq, Ng } = getNFactors(phi);
  const q = gamma * Df;
  const qu = c * Nc + q * Nq + 0.5 * gamma * B * Ng;

  document.getElementById('bc-result').innerHTML =
    `<strong>qu ≈ ${qu.toFixed(0)} kPa</strong><br>Nc=${Nc.toFixed(1)} Nq=${Nq.toFixed(1)} Nγ=${Ng.toFixed(1)}`;

  const { ctx, w, h } = setupCanvas('bc-canvas');
  ctx.clearRect(0, 0, w, h);
  const groundY = h * 0.55;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.strokeStyle = '#64748b';
  ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();
  const fW = Math.min(B * 25, w * 0.4);
  const fX = (w - fW) / 2;
  const fH = 18;
  ctx.fillStyle = '#475569';
  ctx.fillRect(fX, groundY - fH - Df * 8, fW, fH);
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i++) {
    const x = fX + (i + 0.5) * fW / 5;
    ctx.beginPath();
    ctx.moveTo(x, groundY - fH - Df * 8 + 4);
    ctx.lineTo(x, groundY - fH - Df * 8 - 20);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 4, groundY - fH - Df * 8 - 12);
    ctx.lineTo(x, groundY - fH - Df * 8 - 20);
    ctx.lineTo(x + 4, groundY - fH - Df * 8 - 12);
    ctx.stroke();
  }
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '11px system-ui';
  ctx.fillText('Footing', fX, groundY - fH - Df * 8 - 28);
}

function updateConsolidation() {
  const Cc = +document.getElementById('cons-cc').value;
  const e0 = +document.getElementById('cons-e0').value;
  const H = +document.getElementById('cons-h').value;
  const s0 = +document.getElementById('cons-s0').value;
  const ds = +document.getElementById('cons-ds').value;

  document.getElementById('cons-cc-val').textContent = Cc.toFixed(2);
  document.getElementById('cons-e0-val').textContent = e0.toFixed(2);
  document.getElementById('cons-h-val').textContent = H + ' m';
  document.getElementById('cons-s0-val').textContent = s0 + ' kPa';
  document.getElementById('cons-ds-val').textContent = ds + ' kPa';

  const Sc = (Cc * H / (1 + e0)) * Math.log10((s0 + ds) / s0);
  document.getElementById('cons-result').innerHTML =
    `<strong>Sc ≈ ${Sc.toFixed(3)} m</strong><br>(${(Sc * 1000).toFixed(0)} mm)`;

  const { ctx, w, h } = setupCanvas('cons-canvas');
  ctx.clearRect(0, 0, w, h);
  const layerH = Math.min(H * 12, h * 0.5);
  const settlePx = Math.min(Sc * 80, 40);
  ctx.fillStyle = '#334155';
  ctx.fillRect(40, 30, 80, layerH);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(160, 30 + settlePx, 80, layerH - settlePx);
  ctx.strokeStyle = '#3b82f6';
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(120, 30 + layerH);
  ctx.lineTo(160, 30 + layerH);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '11px system-ui';
  ctx.fillText('Before', 50, 20);
  ctx.fillText('After', 170, 20);
  ctx.fillText('↓ Sc', 130, 30 + layerH + 15);
}

function updateDarcy() {
  const kExp = +document.getElementById('darcy-k').value;
  const dh = +document.getElementById('darcy-dh').value;
  const L = +document.getElementById('darcy-l').value;
  const k = Math.pow(10, kExp);

  document.getElementById('darcy-k-val').textContent = k.toExponential(1) + ' m/s';
  document.getElementById('darcy-dh-val').textContent = dh.toFixed(1) + ' m';
  document.getElementById('darcy-l-val').textContent = L + ' m';

  const i = dh / L;
  const v = k * i;

  document.getElementById('darcy-result').innerHTML =
    `<strong>Seepage velocity v = ${v.toExponential(2)} m/s</strong><br>Hydraulic gradient i = ${i.toFixed(3)}`;

  const { ctx, w, h } = setupCanvas('darcy-canvas');
  ctx.clearRect(0, 0, w, h);
  const y = h / 2;
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, y - 30); ctx.lineTo(w - 30, y - 30);
  ctx.moveTo(30, y + 30); ctx.lineTo(w - 30, y + 30);
  ctx.stroke();
  ctx.strokeStyle = '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(50, y - 50); ctx.lineTo(50, y - 10);
  ctx.moveTo(w - 50, y - 20); ctx.lineTo(w - 50, y + 10);
  ctx.stroke();
  ctx.strokeStyle = '#22c55e';
  for (let x = 80; x < w - 80; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x + 20, y);
    ctx.lineTo(x + 14, y - 4); ctx.moveTo(x + 20, y); ctx.lineTo(x + 14, y + 4);
    ctx.stroke();
  }
  ctx.fillStyle = '#e2e8f0';
  ctx.font = '11px system-ui';
  ctx.fillText('High head', 35, y - 55);
  ctx.fillText('Low head', w - 90, y - 25);
  ctx.fillText('Flow →', w / 2 - 20, y + 50);
}

['mc-c','mc-phi','mc-sigma'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateMohrCoulomb));
['rank-phi','rank-h','rank-g'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateRankine));
['bc-c','bc-phi','bc-b','bc-df','bc-g'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateBearing));
['cons-cc','cons-e0','cons-h','cons-s0','cons-ds'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateConsolidation));
['darcy-k','darcy-dh','darcy-l'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateDarcy));

window.addEventListener('resize', () => {
  updateMohrCoulomb(); updateRankine(); updateBearing(); updateConsolidation(); updateDarcy();
});

updateMohrCoulomb();
updateRankine();
updateBearing();
updateConsolidation();
updateDarcy();
