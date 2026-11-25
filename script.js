const scene = new THREE.Scene();
scene.background = new THREE.Color(0x68a8e8);
scene.fog = new THREE.FogExp2(0x8ec2f2, 0.0042);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 600);
camera.position.set(0, 6.2, 11.5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xe2e8f0, 1.05));
const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
sunLight.position.set(40, 65, 30);
scene.add(sunLight);

buildCityTown(scene);

// Canvas Decal Generator for "PRASHANT" branding on Thar
function makePrashantDecal(subText = '') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 160;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 160);

  if (subText) {
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '900 22px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(subText, 256, 32);
  }

  ctx.font = 'italic 900 72px Space Grotesk, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('P', 105, 112);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 58px Space Grotesk, sans-serif';
  ctx.fillText('RASHANT', 295, 110);

  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(95, 128);
  ctx.quadraticCurveTo(260, 118, 435, 134);
  ctx.stroke();

  return new THREE.CanvasTexture(c);
}

// Build Black Thar 3D SUV
const thar = new THREE.Group();
const blackPaint = new THREE.MeshStandardMaterial({ color: 0x0b0d12, metalness: 0.65, roughness: 0.25 });
const matteTrim = new THREE.MeshStandardMaterial({ color: 0x1e2229, roughness: 0.75 });

const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.9, 4.35), blackPaint);
lowerBody.position.y = 0.85;

const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.92, 2.55), blackPaint);
cabin.position.set(0, 1.72, 0.25);

const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.1 });
const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.64, 0.08), glassMat);
frontGlass.position.set(0, 1.72, -1.04);
frontGlass.rotation.x = -0.18;

const sideGlassL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.56, 2.2), glassMat);
sideGlassL.position.set(-1.0, 1.75, 0.25);
const sideGlassR = sideGlassL.clone();
sideGlassR.position.x = 1.0;

const grille = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.52, 0.12), matteTrim);
grille.position.set(0, 1.02, -2.2);

const headLightMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
const hlGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 20);
hlGeo.rotateX(Math.PI / 2);
const hlL = new THREE.Mesh(hlGeo, headLightMat);
hlL.position.set(-0.82, 1.02, -2.18);
const hlR = hlL.clone();
hlR.position.x = 0.82;

const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.42, 0.36), matteTrim);
frontBumper.position.set(0, 0.58, -2.28);
const rearBumper = frontBumper.clone();
rearBumper.position.z = 2.28;

const spareTire = new THREE.Mesh(
  new THREE.CylinderGeometry(0.56, 0.56, 0.34, 24),
  new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.85 })
);
spareTire.rotation.x = Math.PI / 2;
spareTire.position.set(0, 1.25, 2.34);

const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.46, 0.1), tailMat);
tlL.position.set(-0.92, 1.05, 2.2);
const tlR = tlL.clone();
tlR.position.x = 0.92;

const doorDecalTex = makePrashantDecal('');
const doorDecalMat = new THREE.MeshBasicMaterial({ map: doorDecalTex, transparent: true, depthWrite: false });
const doorDecalL = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.52), doorDecalMat);
doorDecalL.position.set(-1.135, 0.88, 0.1);
doorDecalL.rotation.y = -Math.PI / 2;

const doorDecalR = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.52), doorDecalMat);
doorDecalR.position.set(1.135, 0.88, 0.1);
doorDecalR.rotation.y = Math.PI / 2;

const rearDecal = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 0.46),
  new THREE.MeshBasicMaterial({ map: makePrashantDecal(''), transparent: true, depthWrite: false })
);
rearDecal.position.set(0, 1.96, 1.54);

thar.add(
  lowerBody, cabin, frontGlass, sideGlassL, sideGlassR,
  grille, hlL, hlR, frontBumper, rearBumper, spareTire, tlL, tlR,
  doorDecalL, doorDecalR, rearDecal
);

const wheels = [];
const wheelGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.42, 20);
wheelGeo.rotateZ(Math.PI / 2);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x12151a, roughness: 0.78 });
[[-1.22, 0.58, 1.4], [1.22, 0.58, 1.4], [-1.22, 0.58, -1.4], [1.22, 0.58, -1.4]].forEach(([x, y, z]) => {
  const w = new THREE.Mesh(wheelGeo, wheelMat);
  w.position.set(x, y, z);
  thar.add(w);
  wheels.push(w);
});
scene.add(thar);

// Collectible Coins on Highway
const coins = [];
const coinGeo = new THREE.CylinderGeometry(0.95, 0.95, 0.22, 20);
coinGeo.rotateX(Math.PI / 2);
const coinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.5, roughness: 0.25 });

function spawnCoin() {
  const angle = Math.random() * Math.PI * 2;
  const dist = 14 + Math.random() * (townLimit - 30);
  const m = new THREE.Mesh(coinGeo, coinMat);
  m.position.set(Math.cos(angle) * dist, 1.25, Math.sin(angle) * dist);
  scene.add(m);
  coins.push(m);
}
for (let i = 0; i < 20; i++) spawnCoin();

// State & Controls
const keys = {};
function setKey(k, state) { keys[k] = state; }
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space' && Math.abs(speed) > 0.2) playBoostPulse();
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

let gear = 'D';
function setGear(g) {
  gear = g;
  document.querySelectorAll('#gearBox button').forEach(b => b.classList.toggle('active', b.dataset.gear === g));
  playTone(540, 0.06, 'sine', 0.05);
}

let paused = false;
function togglePause() {
  paused = !paused;
  document.getElementById('pauseBtn').textContent = paused ? '▶' : '❚❚';
}

let camMode = 0; // 0: Chase, 1: Close Rear, 2: High Highway
function cycleCamera() {
  camMode = (camMode + 1) % 3;
  playTone(660, 0.07, 'sine', 0.06);
}

function resetThar() {
  thar.position.set(0, 0, 12);
  thar.rotation.y = 0;
  speed = 0;
  steerAngle = 0;
}

// Interactive Wheel Drag
let steerAngle = 0; // -1 left to +1 right
let wheelDragging = false;
let wheelCenter = { x: 0, y: 0 };
const wheelEl = document.getElementById('steeringWheel');

wheelEl.addEventListener('pointerdown', e => {
  e.stopPropagation();
  wheelDragging = true;
  const r = wheelEl.getBoundingClientRect();
  wheelCenter = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
});
window.addEventListener('pointerup', () => { wheelDragging = false; });
window.addEventListener('pointermove', e => {
  if (!wheelDragging) return;
  const dx = e.clientX - wheelCenter.x;
  steerAngle = Math.max(-1, Math.min(1, dx / 52));
});

let speed = 0, score = 12500, fuel = 82;

function animate() {
  requestAnimationFrame(animate);

  if (!paused) {
    const keySteer = ((keys['KeyA'] || keys['ArrowLeft']) ? -1 : 0) + ((keys['KeyD'] || keys['ArrowRight']) ? 1 : 0);
    if (keySteer !== 0) {
      steerAngle += (keySteer - steerAngle) * 0.25;
    } else if (!wheelDragging) {
      steerAngle *= 0.85;
    }
    wheelEl.style.transform = `rotate(${steerAngle * 65}deg)`;

    const gasPressed = Boolean(keys['KeyW'] || keys['ArrowUp']);
    const brakePressed = Boolean(keys['KeyS'] || keys['ArrowDown']);
    const nosPressed = Boolean(keys['Space']) && fuel > 1;

    if (nosPressed && Math.abs(speed) > 0.15) {
      fuel = Math.max(0, fuel - 0.14);
      document.getElementById('fuelFill').style.width = `${fuel}%`;
    } else {
      fuel = Math.min(100, fuel + 0.02);
      document.getElementById('fuelFill').style.width = `${fuel}%`;
    }

    const maxFwd = nosPressed ? 1.65 : 1.05;
    if (gear === 'P' || gear === 'N') {
      speed *= 0.94;
    } else if (gear === 'D') {
      if (gasPressed) {
        speed = Math.min(maxFwd, speed + 0.032 + (nosPressed ? 0.025 : 0));
      } else if (brakePressed) {
        speed = Math.max(0, speed - 0.055);
      } else {
        speed *= 0.972;
      }
    } else if (gear === 'R') {
      if (gasPressed || brakePressed) {
        speed = Math.max(-0.55, speed - 0.026);
      } else {
        speed *= 0.95;
      }
    }

    if (Math.abs(speed) > 0.02) {
      thar.rotation.y -= steerAngle * 0.042 * (speed >= 0 ? 1 : -1);
    }

    cabin.rotation.z += (-steerAngle * 0.075 - cabin.rotation.z) * 0.15;
    thar.position.x -= Math.sin(thar.rotation.y) * speed;
    thar.position.z -= Math.cos(thar.rotation.y) * speed;

    // Building collisions
    buildingColliders.forEach(b => {
      const dx = thar.position.x - b.x;
      const dz = thar.position.z - b.z;
      const d = Math.hypot(dx, dz);
      const minDist = b.radius + 2.1;
      if (d < minDist && d > 0.001) {
        thar.position.x = b.x + (dx / d) * minDist;
        thar.position.z = b.z + (dz / d) * minDist;
        speed *= -0.35;
        spawnSpark(scene, thar.position, 0xf43f5e);
      }
    });

    // Boost pads
    roadBoostPads.forEach(pad => {
      if (Math.hypot(thar.position.x - pad.position.x, thar.position.z - pad.position.z) < 3.4) {
        speed = Math.min(1.75, speed + 0.08);
        spawnSpark(scene, thar.position, 0x22d3ee);
      }
    });

    if ((nosPressed || Math.abs(steerAngle) > 0.45) && Math.abs(speed) > 0.4 && Math.random() < 0.6) {
      spawnSpark(scene, thar.position, nosPressed ? 0x38bdf8 : 0xfacc15);
    }
    updateSparks(scene);

    const maxBound = townLimit - 6;
    thar.position.x = Math.max(-maxBound, Math.min(maxBound, thar.position.x));
    thar.position.z = Math.max(-maxBound, Math.min(maxBound, thar.position.z));

    wheels.forEach(w => { w.rotation.x -= speed * 0.85; });

    // Collect coins
    const now = performance.now() * 0.003;
    for (let i = coins.length - 1; i >= 0; i--) {
      const c = coins[i];
      c.rotation.y += 0.035;
      c.position.y = 1.25 + Math.sin(now + i) * 0.2;
      if (c.position.distanceTo(thar.position) < 2.7) {
        scene.remove(c);
        coins.splice(i, 1);
        score += nosPressed ? 150 : 100;
        playCorePickup();
        spawnCoin();
      }
    }

    if (Math.abs(speed) > 0.1) score += nosPressed ? 0.5 : 0.15;
  }

  document.getElementById('scoreVal').innerText = Math.floor(score);
  document.getElementById('speedVal').innerText = Math.round(Math.abs(speed) * 145);

  const camDist = camMode === 0 ? 9.5 : camMode === 1 ? 6.6 : 15;
  const camHeight = camMode === 0 ? 4.4 : camMode === 1 ? 2.8 : 9.2;
  const desiredCam = new THREE.Vector3(
    thar.position.x + Math.sin(thar.rotation.y) * camDist,
    thar.position.y + camHeight,
    thar.position.z + Math.cos(thar.rotation.y) * camDist
  );
  camera.position.lerp(desiredCam, 0.11);
  camera.lookAt(thar.position.x, thar.position.y + 1.35, thar.position.z);

  drawMinimap(thar.position.x, thar.position.z, thar.rotation.y);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
