const arenaRadius = 75;
const pillars = [];
const boostPads = [];
const sparks = [];

function buildArena(scene) {
  const grid = new THREE.GridHelper(arenaRadius * 2, 60, 0x38bdf8, 0x1e293b);
  scene.add(grid);

  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(arenaRadius, arenaRadius, 3.5, 64, 1, true),
    new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.25 })
  );
  wall.position.y = 1.75;
  scene.add(wall);

  // Neon Arena Pillars
  const pillarGeo = new THREE.BoxGeometry(2.2, 6.5, 2.2);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, emissive: 0x312e81, metalness: 0.6, roughness: 0.3 });
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const dist = 38;
    const p = new THREE.Mesh(pillarGeo, pillarMat);
    p.position.set(Math.cos(angle) * dist, 3.25, Math.sin(angle) * dist);
    scene.add(p);
    pillars.push(p);
  }

  // Glowing Boost Pads
  const padGeo = new THREE.RingGeometry(1.8, 3.0, 28);
  padGeo.rotateX(-Math.PI / 2);
  const padMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, side: THREE.DoubleSide });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2 + 0.4;
    const dist = 22;
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(Math.cos(angle) * dist, 0.05, Math.sin(angle) * dist);
    scene.add(pad);
    boostPads.push(pad);
  }
}

function spawnSpark(scene, pos, colorHex = 0x38bdf8) {
  const s = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.24, 0.24),
    new THREE.MeshBasicMaterial({ color: colorHex })
  );
  s.position.copy(pos);
  s.userData.vel = new THREE.Vector3(
    (Math.random() - 0.5) * 0.22,
    Math.random() * 0.16 + 0.04,
    (Math.random() - 0.5) * 0.22
  );
  s.userData.life = 18;
  scene.add(s);
  sparks.push(s);
}

function updateSparks(scene) {
  for (let i = sparks.length - 1; i >= 0; i--) {
    const sp = sparks[i];
    sp.position.add(sp.userData.vel);
    sp.userData.life -= 1;
    sp.scale.setScalar(Math.max(0.05, sp.userData.life / 18));
    if (sp.userData.life <= 0) {
      scene.remove(sp);
      sparks.splice(i, 1);
    }
  }
}
