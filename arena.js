const townLimit = 140;
const buildingColliders = [];
const roadBoostPads = [];
const sparks = [];

function makeHighwayTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#252932';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 4000; i++) {
    const v = 30 + Math.floor(Math.random() * 20);
    ctx.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  // White dashed highway lanes
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.8)';
  ctx.lineWidth = 4;
  ctx.setLineDash([26, 22]);
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();

  // Yellow divider line
  ctx.setLineDash([]);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(246, 0); ctx.lineTo(246, 512);
  ctx.stroke();

  return new THREE.CanvasTexture(c);
}

function makeSignboardTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 192;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#0f5132';
  ctx.fillRect(0, 0, 512, 192);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 176);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px Space Grotesk, sans-serif';
  ctx.fillText('Kathmandu  ↑ 120 km', 34, 62);
  ctx.fillText('Pokhara    ↑ 200 km', 34, 110);
  ctx.fillText('Butwal     ↑ 90 km', 34, 158);
  return new THREE.CanvasTexture(c);
}

function buildCityTown(scene) {
  // Green hills & terrain around highway
  const terrain = new THREE.Mesh(
    new THREE.PlaneGeometry(townLimit * 2.8, townLimit * 2.8),
    new THREE.MeshStandardMaterial({ color: 0x3b6e3c, roughness: 0.92 })
  );
  terrain.rotation.x = -Math.PI / 2;
  terrain.position.y = -0.06;
  scene.add(terrain);

  const roadTex = makeHighwayTexture();
  roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
  roadTex.repeat.set(8, 8);

  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(townLimit * 2, townLimit * 2),
    new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.78 })
  );
  road.rotation.x = -Math.PI / 2;
  scene.add(road);

  // Highway Gantry Signboard
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 4.1),
    new THREE.MeshBasicMaterial({ map: makeSignboardTexture() })
  );
  board.position.set(-7, 7.5, -28);
  scene.add(board);

  // Town / Highway Buildings & Roadside Hills
  const blockCoords = [-84, -44, 44, 84];
  const wallColors = [0x475569, 0x334155, 0x64748b, 0x1e293b];

  blockCoords.forEach((bx, ix) => {
    blockCoords.forEach((bz, iz) => {
      const h = 10 + ((ix * 5 + iz * 11) % 4) * 5;
      const w = 15;
      const d = 15;
      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: wallColors[(ix + iz) % wallColors.length], roughness: 0.65 })
      );
      bldg.position.set(bx, h / 2, bz);
      scene.add(bldg);
      buildingColliders.push({ x: bx, z: bz, radius: 9 });
    });
  });

  // Distant Mountain Ridge
  const hillMat = new THREE.MeshStandardMaterial({ color: 0x2f5d38, roughness: 0.95 });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const r = townLimit + 18;
    const hill = new THREE.Mesh(new THREE.ConeGeometry(28 + (i % 3) * 8, 22 + (i % 4) * 6, 7), hillMat);
    hill.position.set(Math.cos(a) * r, 9, Math.sin(a) * r);
    scene.add(hill);
  }

  // Highway Streetlights
  const poleGeo = new THREE.CylinderGeometry(0.14, 0.18, 7.5, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6 });
  for (let z = -110; z <= 110; z += 28) {
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(14, 3.75, z);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.14, 0.14), poleMat);
    arm.position.set(12.9, 7.4, z);
    scene.add(pole, arm);
  }

  // Boost Pads
  const padGeo = new THREE.BoxGeometry(3.4, 0.08, 5.2);
  const padMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  [[0, -56], [0, 56], [-56, 0], [56, 0]].forEach(([px, pz]) => {
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(px, 0.04, pz);
    scene.add(pad);
    roadBoostPads.push(pad);
  });
}

function drawMinimap(carX, carZ, carYaw) {
  const c = document.getElementById('minimapCanvas');
  if (!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(20, 32, 24, 0.9)';
  ctx.fillRect(0, 0, w, h);

  // Cross roads on radar
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h);
  ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2);
  ctx.stroke();

  // Car marker at center pointing according to yaw
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-carYaw);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -9);
  ctx.lineTo(6, 7);
  ctx.lineTo(0, 4);
  ctx.lineTo(-6, 7);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
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
