// Mohr-Coulomb
function updateMohrCoulomb() {
  const c = +document.getElementById('mc-c').value;
  const phi = +document.getElementById('mc-phi').value;
  const sigma = +document.getElementById('mc-sigma').value;

  document.getElementById('mc-c-val').textContent = c + ' kPa';
  document.getElementById('mc-phi-val').textContent = phi + '°';
  document.getElementById('mc-sigma-val').textContent = sigma + ' kPa';

  const tau = c + sigma * Math.tan(phi * Math.PI / 180);
  document.getElementById('mc-result').innerHTML = 
    `<strong>Shear strength τ = ${tau.toFixed(1)} kPa</strong><br>
     At failure plane angle ≈ ${(45 + phi/2).toFixed(1)}° to major principal plane`;
}

// Rankine
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
    `<strong>Ka = ${Ka.toFixed(3)}</strong> &nbsp;&nbsp; <strong>Kp = ${Kp.toFixed(2)}</strong><br>
     Total active thrust Pa ≈ ${Pa.toFixed(1)} kN/m (acts at H/3 from base)`;
}

// Approximate bearing capacity factors (teaching values)
function getNFactors(phi) {
  if (phi <= 0) return { Nc: 5.7, Nq: 1, Ng: 0 };
  // Simple approximations for teaching
  const phiR = phi * Math.PI / 180;
  const Nq = Math.exp(Math.PI * Math.tan(phiR)) * Math.pow(Math.tan(Math.PI/4 + phiR/2), 2);
  const Nc = (Nq - 1) / Math.tan(phiR);
  const Ng = 2 * (Nq + 1) * Math.tan(phiR); // rough
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
  const q = gamma * Df; // overburden
  const qu = c * Nc + q * Nq + 0.5 * gamma * B * Ng;

  document.getElementById('bc-result').innerHTML = 
    `<strong>Ultimate bearing capacity qu ≈ ${qu.toFixed(0)} kPa</strong><br>
     Factors (approx): Nc=${Nc.toFixed(1)}, Nq=${Nq.toFixed(1)}, Nγ=${Ng.toFixed(1)}<br>
     Net qu ≈ ${(qu - q).toFixed(0)} kPa`;
}

// Consolidation
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
    `<strong>Primary consolidation settlement Sc ≈ ${Sc.toFixed(3)} m</strong><br>
     (${(Sc * 1000).toFixed(0)} mm)`;
}

// Wire up all
['mc-c','mc-phi','mc-sigma'].forEach(id => 
  document.getElementById(id).addEventListener('input', updateMohrCoulomb));
['rank-phi','rank-h','rank-g'].forEach(id => 
  document.getElementById(id).addEventListener('input', updateRankine));
['bc-c','bc-phi','bc-b','bc-df','bc-g'].forEach(id => 
  document.getElementById(id).addEventListener('input', updateBearing));
['cons-cc','cons-e0','cons-h','cons-s0','cons-ds'].forEach(id => 
  document.getElementById(id).addEventListener('input', updateConsolidation));

// Initial
updateMohrCoulomb();
updateRankine();
updateBearing();
updateConsolidation();
