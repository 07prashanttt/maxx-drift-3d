const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x030712, 0.0085);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 500);
camera.position.set(0, 9, 16);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x94a3b8, 0.85));
const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
dirLight.position.set(20, 35, 15);
scene.add(dirLight);

buildArena(scene);

// 3D Cyber Car
const car = new THREE.Group();
const bodyMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.6, roughness: 0.25 });
const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.75, 4.1), bodyMat);
chassis.position.y = 0.65;

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.55, 1.9),
  new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.3, roughness: 0.15 })
);
cabin.position.set(0, 1.2, -0.2);

const neonBar = new THREE.Mesh(
  new THREE.BoxGeometry(2.2, 0.14, 0.25),
  new THREE.MeshBasicMaterial({ color: 0xf43f5e })
);
neonBar.position.set(0, 0.55, -2.05);

car.add(chassis, cabin, neonBar);

function setCarColor(hex) {
  bodyMat.color.setHex(hex);
  playTone(580, 0.08, 'sine', 0.06);
}

const wheels = [];
const wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 20);
wheelGeo.rotateZ(Math.PI / 2);
const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
[[-1.15, 0.55, 1.3], [1.15, 0.55, 1.3], [-1.15, 0.55, -1.3], [1.15, 0.55, -1.3]].forEach(([x, y, z]) => {
  const w = new THREE.Mesh(wheelGeo, wheelMat);
  w.position.set(x, y, z);
  car.add(w);
  wheels.push(w);
});

scene.add(car);

// Collectible Energy Cores
const cores = [];
const coreGeo = new THREE.OctahedronGeometry(1.05, 0);
const coreMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 0.55 });

function spawnCore() {
  const angle = Math.random() * Math.PI * 2;
  const dist = 10 + Math.random() * (arenaRadius - 16);
  const mesh = new THREE.Mesh(coreGeo, coreMat);
  mesh.position.set(Math.cos(angle) * dist, 1.3, Math.sin(angle) * dist);
  scene.add(mesh);
  cores.push(mesh);
}
for (let i = 0; i < 16; i++) spawnCore();

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
  const maxSpd = boosting ? 1.5 : 0.9;

  if (accel !== 0) {
    speed = Math.max(-0.45, Math.min(maxSpd, speed + accel + (boosting && accel > 0 ? 0.022 : 0)));
  } else {
    speed *= 0.965;
  }

  const turnInput = ((keys['KeyA'] || keys['ArrowLeft']) ? 1 : 0) - ((keys['KeyD'] || keys['ArrowRight']) ? 1 : 0);
  if (Math.abs(speed) > 0.02) {
    car.rotation.y += turnInput * 0.044 * (speed >= 0 ? 1 : -1);
  }

  chassis.rotation.z += (-turnInput * 0.13 - chassis.rotation.z) * 0.15;
  car.position.x -= Math.sin(car.rotation.y) * speed;
  car.position.z -= Math.cos(car.rotation.y) * speed;

  // Pillar collision bounce
  pillars.forEach(p => {
    const dx = car.position.x - p.position.x;
    const dz = car.position.z - p.position.z;
    const d = Math.hypot(dx, dz);
    if (d < 2.6 && d > 0.001) {
      car.position.x = p.position.x + (dx / d) * 2.6;
      car.position.z = p.position.z + (dz / d) * 2.6;
      speed *= -0.4;
      spawnSpark(scene, car.position, 0xf43f5e);
    }
  });

  // Boost pads
  boostPads.forEach(pad => {
    if (Math.hypot(car.position.x - pad.position.x, car.position.z - pad.position.z) < 3.1) {
      speed = Math.min(1.65, speed + 0.08);
      spawnSpark(scene, car.position, 0x22d3ee);
    }
  });

  // Drift / Boost sparks
  if ((boosting || Math.abs(turnInput) > 0) && Math.abs(speed) > 0.35 && Math.random() < 0.65) {
    spawnSpark(scene, car.position, boosting ? 0xfacc15 : 0x38bdf8);
  }
  updateSparks(scene);

  // Arena boundary
  const distFromCenter = Math.hypot(car.position.x, car.position.z);
  const limit = arenaRadius - 2.6;
  if (distFromCenter > limit) {
    const scale = limit / distFromCenter;
    car.position.x *= scale;
    car.position.z *= scale;
    speed *= -0.35;
  }

  wheels.forEach(w => { w.rotation.x -= speed * 0.8; });

  // Cores
  const now = performance.now() * 0.003;
  for (let i = cores.length - 1; i >= 0; i--) {
    const c = cores[i];
    c.rotation.y += 0.03;
    c.position.y = 1.3 + Math.sin(now + i) * 0.25;
    if (c.position.distanceTo(car.position) < 2.5) {
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

  const totalYaw = car.rotation.y + camYaw;
  const desiredCamPos = new THREE.Vector3(
    car.position.x + Math.sin(totalYaw) * 12,
    car.position.y + 6.2,
    car.position.z + Math.cos(totalYaw) * 12
  );
  camera.position.lerp(desiredCamPos, 0.1);
  camera.lookAt(car.position.x, car.position.y + 1.1, car.position.z);

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
