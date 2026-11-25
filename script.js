const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1220);
scene.fog = new THREE.FogExp2(0x0b1220, 0.0065);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 8.5, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xcbd5e1, 0.95));
const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.5);
sunLight.position.set(35, 55, 25);
scene.add(sunLight);

buildCityTown(scene);

// Canvas Decal Generator for "PRASHANT" branding on Thar
function makePrashantDecal(subText = '') {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 160;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 160);

  if (subText) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '900 22px Orbitron, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(subText, 256, 32);
  }

  // Red stylized 'P' + White 'RASHANT'
  ctx.font = 'italic 900 72px Space Grotesk, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ef4444';
  ctx.fillText('P', 105, 112);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 58px Space Grotesk, sans-serif';
  ctx.fillText('RASHANT', 295, 110);

  // Red underline swoosh
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

// Lower boxy SUV body + fender flares
const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.9, 4.35), blackPaint);
lowerBody.position.y = 0.85;

// Hardtop cabin
const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.98, 0.92, 2.55), blackPaint);
cabin.position.set(0, 1.72, 0.25);

// Windshield & side windows
const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.1 });
const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.64, 0.08), glassMat);
frontGlass.position.set(0, 1.72, -1.04);
frontGlass.rotation.x = -0.18;

const sideGlassL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.56, 2.2), glassMat);
sideGlassL.position.set(-1.0, 1.75, 0.25);
const sideGlassR = sideGlassL.clone();
sideGlassR.position.x = 1.0;

// Front 7-slot grille + round LED headlights
const grille = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.52, 0.12), matteTrim);
grille.position.set(0, 1.02, -2.2);

const headLightMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
const hlGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.1, 20);
hlGeo.rotateX(Math.PI / 2);
const hlL = new THREE.Mesh(hlGeo, headLightMat);
hlL.position.set(-0.82, 1.02, -2.18);
const hlR = hlL.clone();
hlR.position.x = 0.82;

// Front & Rear bumpers
const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(2.36, 0.42, 0.36), matteTrim);
frontBumper.position.set(0, 0.58, -2.28);
const rearBumper = frontBumper.clone();
rearBumper.position.z = 2.28;

// Rear spare wheel mounted on tailgate
const spareTire = new THREE.Mesh(
  new THREE.CylinderGeometry(0.56, 0.56, 0.34, 24),
  new THREE.MeshStandardMaterial({ color: 0x111317, roughness: 0.85 })
);
spareTire.rotation.x = Math.PI / 2;
spareTire.position.set(0, 1.25, 2.34);

// Red tail lights
const tailMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
const tlL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.46, 0.1), tailMat);
tlL.position.set(-0.92, 1.05, 2.2);
const tlR = tlL.clone();
tlR.position.x = 0.92;

// "PRASHANT" decals on Left Door, Right Door, and Windshield
const doorDecalTex = makePrashantDecal('');
const doorDecalMat = new THREE.MeshBasicMaterial({ map: doorDecalTex, transparent: true, depthWrite: false });
const doorDecalL = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.52), doorDecalMat);
doorDecalL.position.set(-1.135, 0.88, 0.1);
doorDecalL.rotation.y = -Math.PI / 2;

const doorDecalR = new THREE.Mesh(new THREE.PlaneGeometry(1.65, 0.52), doorDecalMat);
doorDecalR.position.set(1.135, 0.88, 0.1);
doorDecalR.rotation.y = Math.PI / 2;

const visorDecal = new THREE.Mesh(
  new THREE.PlaneGeometry(1.45, 0.42),
  new THREE.MeshBasicMaterial({ map: makePrashantDecal('THAR'), transparent: true, depthWrite: false })
);
visorDecal.position.set(0, 1.98, -1.08);
visorDecal.rotation.y = Math.PI;

thar.add(
  lowerBody, cabin, frontGlass, sideGlassL, sideGlassR,
  grille, hlL, hlR, frontBumper, rearBumper, spareTire, tlL, tlR,
  doorDecalL, doorDecalR, visorDecal
);

// 4 Off-road Wheels
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

// Collectible Town Tokens
const cores = [];
const coreGeo = new THREE.OctahedronGeometry(1.05, 0);
const coreMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.55 });

function spawnCore() {
  const angle = Math.random() * Math.PI * 2;
  const dist = 12 + Math.random() * (townLimit - 24);
  const mesh = new THREE.Mesh(coreGeo, coreMat);
  mesh.position.set(Math.cos(angle) * dist, 1.35, Math.sin(angle) * dist);
  scene.add(mesh);
  cores.push(mesh);
}
for (let i = 0; i < 18; i++) spawnCore();

// Controls & Camera Orbit
const keys = {};
function setKey(k, state) { keys[k] = state; }
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (e.code === 'Space' && Math.abs(speed) > 0.2) playBoostPulse();
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

let speed = 0, score = 0, collected = 0, camYaw = 0, dragging = false, lastX = 0;
renderer.domElement.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; });
window.addEventListener('pointerup', () => { dragging = false; });
window.addEventListener('pointermove', e => {
  if (!dragging) return;
  camYaw -= (e.clientX - lastX) * 0.006;
  lastX = e.clientX;
});

function animate() {
  requestAnimationFrame(animate);

  const accel = (keys['KeyW'] || keys['ArrowUp']) ? 0.032 : (keys['KeyS'] || keys['ArrowDown']) ? -0.024 : 0;
  const boosting = Boolean(keys['Space']);
  const maxSpd = boosting ? 1.55 : 0.92;

  if (accel !== 0) {
    speed = Math.max(-0.45, Math.min(maxSpd, speed + accel + (boosting && accel > 0 ? 0.022 : 0)));
  } else {
    speed *= 0.965;
  }

  const turnInput = ((keys['KeyA'] || keys['ArrowLeft']) ? 1 : 0) - ((keys['KeyD'] || keys['ArrowRight']) ? 1 : 0);
  if (Math.abs(speed) > 0.02) {
    thar.rotation.y += turnInput * 0.043 * (speed >= 0 ? 1 : -1);
  }

  cabin.rotation.z += (-turnInput * 0.08 - cabin.rotation.z) * 0.14;
  thar.position.x -= Math.sin(thar.rotation.y) * speed;
  thar.position.z -= Math.cos(thar.rotation.y) * speed;

  // Building collision pushback
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

  // Road boost pads
  roadBoostPads.forEach(pad => {
    if (Math.hypot(thar.position.x - pad.position.x, thar.position.z - pad.position.z) < 3.4) {
      speed = Math.min(1.7, speed + 0.08);
      spawnSpark(scene, thar.position, 0x22d3ee);
    }
  });

  if ((boosting || Math.abs(turnInput) > 0) && Math.abs(speed) > 0.35 && Math.random() < 0.65) {
    spawnSpark(scene, thar.position, boosting ? 0xfacc15 : 0x38bdf8);
  }
  updateSparks(scene);

  // Town outer boundary
  const maxBound = townLimit - 5;
  thar.position.x = Math.max(-maxBound, Math.min(maxBound, thar.position.x));
  thar.position.z = Math.max(-maxBound, Math.min(maxBound, thar.position.z));

  wheels.forEach(w => { w.rotation.x -= speed * 0.82; });

  // Collect tokens
  const now = performance.now() * 0.003;
  for (let i = cores.length - 1; i >= 0; i--) {
    const c = cores[i];
    c.rotation.y += 0.03;
    c.position.y = 1.35 + Math.sin(now + i) * 0.25;
    if (c.position.distanceTo(thar.position) < 2.7) {
      scene.remove(c);
      cores.splice(i, 1);
      collected += 1;
      score += boosting ? 50 : 25;
      playCorePickup();
      spawnCore();
    }
  }

  if (Math.abs(speed) > 0.08) score += boosting ? 0.45 : 0.15;

  document.getElementById('scoreVal').innerText = Math.floor(score);
  document.getElementById('coreVal').innerText = collected;
  document.getElementById('speedVal').innerText = `${Math.round(Math.abs(speed) * 165)} KM/H`;

  // Smooth Chase Camera
  const totalYaw = thar.rotation.y + camYaw;
  const desiredCamPos = new THREE.Vector3(
    thar.position.x + Math.sin(totalYaw) * 11.5,
    thar.position.y + 5.8,
    thar.position.z + Math.cos(totalYaw) * 11.5
  );
  camera.position.lerp(desiredCamPos, 0.1);
  camera.lookAt(thar.position.x, thar.position.y + 1.3, thar.position.z);

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
