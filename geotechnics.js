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

  const wallX = 90;
  const topY = 20;
  const baseY = h - 30;
  const soilRight = w - 20;

  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(wallX, topY + 10);
  ctx.lineTo(soilRight, topY + 10);
  ctx.lineTo(soilRight, baseY);
  ctx.lineTo(wallX, baseY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#64748b';
  ctx.fillRect(wallX - 12, topY, 12, baseY - topY);

  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  ctx.lineTo(w, baseY);
  ctx.stroke();

  const maxP = Ka * gamma * H;
  const maxLen = 70;
  for (let i = 1; i <= 5; i++) {
    const frac = i / 5;
    const y = topY + 15 + frac * (baseY - topY - 30);
    const len = Math.max(15, frac * maxLen * (maxP / Math.max(maxP, 50)));
    const xStart = wallX + 4;
    const xEnd = xStart + len;

    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(xStart, y);
    ctx.lineTo(xEnd, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(xEnd, y);
    ctx.lineTo(xEnd - 5, y - 3);
    ctx.moveTo(xEnd, y);
    ctx.lineTo(xEnd - 5, y + 3);
    ctx.stroke();
  }

  const resY = topY + (2/3) * (baseY - topY);
  const resLen = Math.min(85, 30 + Pa / 10);
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(wallX + 4, resY);
  ctx.lineTo(wallX + 4 + resLen, resY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(wallX + 4 + resLen, resY);
  ctx.lineTo(wallX - 2 + resLen, resY - 5);
  ctx.moveTo(wallX + 4 + resLen, resY);
  ctx.lineTo(wallX - 2 + resLen, resY + 5);
  ctx.stroke();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px system-ui';
  ctx.fillText('Retaining wall', 10, 40);
  ctx.fillText('Soil', wallX + 20, topY + 35);
  ctx.fillStyle = '#f87171';
  ctx.fillText('Pa (resultant)', wallX + resLen - 10, resY - 10);
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('Active pressure on soil', wallX + 15, baseY - 10);
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
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, groundY, w, h - groundY);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(w, groundY);
  ctx.stroke();

  const fW = Math.min(Math.max(B * 28, 70), w * 0.4);
  const fX = (w - fW) / 2;
  const fH = 20;
  const embed = Math.min(Df * 5, 25);
  const fY = groundY - fH - embed;
  ctx.fillStyle = '#475569';
  ctx.fillRect(fX, fY, fW, fH);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(fX, fY, fW, fH);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  const loadX = fX + fW / 2;
  ctx.beginPath();
  ctx.moveTo(loadX, fY - 35);
  ctx.lineTo(loadX, fY - 4);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(loadX, fY - 4);
  ctx.lineTo(loadX - 5, fY - 12);
  ctx.moveTo(loadX, fY - 4);
  ctx.lineTo(loadX + 5, fY - 12);
  ctx.stroke();

  const arrowScale = Math.min(40, Math.max(15, qu / 30));
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 2;
  const n = 6;
  for (let i = 0; i < n; i++) {
    const x = fX + (i + 0.5) * fW / n;
    const y1 = fY + fH + 2;
    const y2 = y1 + arrowScale;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x - 4, y1 + 6);
    ctx.moveTo(x, y1);
    ctx.lineTo(x + 4, y1 + 6);
    ctx.stroke();
  }

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px system-ui';
  ctx.fillText('Footing', fX + fW/2 - 22, fY - 8);
  ctx.fillStyle = '#fbbf24';
  ctx.fillText('Applied load', loadX + 8, fY - 25);
  ctx.fillStyle = '#f87171';
  ctx.fillText('Soil reaction', fX + 5, groundY + 20);
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('Soil', 15, groundY + 25);
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
