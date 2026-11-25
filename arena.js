const townLimit = 115;
const buildingColliders = [];
const roadBoostPads = [];
const sparks = [];

function makeRoadTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 512;
  const ctx = c.getContext('2d');

  // Asphalt base
  ctx.fillStyle = '#1f242d';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle asphalt grain
  for (let i = 0; i < 3500; i++) {
    const shade = 25 + Math.floor(Math.random() * 22);
    ctx.fillStyle = `rgb(${shade},${shade + 2},${shade + 6})`;
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }

  // Center dashed lane line
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 5;
  ctx.setLineDash([22, 18]);
  ctx.beginPath();
  ctx.moveTo(256, 0); ctx.lineTo(256, 512);
  ctx.moveTo(0, 256); ctx.lineTo(512, 256);
  ctx.stroke();

  // Outer road edge lines
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.65)';
  ctx.lineWidth = 4;
  ctx.strokeRect(42, 42, 428, 428);

  return new THREE.CanvasTexture(c);
}

function buildCityTown(scene) {
  // Town ground & main road cross
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(townLimit * 2.4, townLimit * 2.4),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  scene.add(ground);

  const roadTex = makeRoadTexture();
  roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
  roadTex.repeat.set(6, 6);

  const roadSurface = new THREE.Mesh(
    new THREE.PlaneGeometry(townLimit * 2, townLimit * 2),
    new THREE.MeshStandardMaterial({ map: roadTex, roughness: 0.82 })
  );
  roadSurface.rotation.x = -Math.PI / 2;
  scene.add(roadSurface);

  // City / Town Buildings in blocks around roads
  const wallColors = [0x334155, 0x475569, 0x273549, 0x3f4e63, 0x1e293b];
  const blockCoords = [-72, -36, 36, 72];

  blockCoords.forEach((bx, ix) => {
    blockCoords.forEach((bz, iz) => {
      const h = 10 + ((ix * 7 + iz * 13) % 5) * 6;
      const w = 16 + ((ix + iz) % 3) * 3;
      const d = 16 + ((ix * 3 + iz) % 3) * 3;

      const bldg = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({
          color: wallColors[(ix + iz) % wallColors.length],
          roughness: 0.6,
          metalness: 0.2
        })
      );
      bldg.position.set(bx, h / 2, bz);
      scene.add(bldg);

      // Glowing windows strip
      const win = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.2, 1.1, d + 0.2),
        new THREE.MeshBasicMaterial({ color: (ix + iz) % 2 === 0 ? 0xfde68a : 0x38bdf8 })
      );
      win.position.set(bx, h * 0.65, bz);
      scene.add(win);

      buildingColliders.push({ x: bx, z: bz, radius: Math.max(w, d) * 0.56 });
    });
  });

  // Town Streetlights along main avenues
  const poleGeo = new THREE.CylinderGeometry(0.16, 0.2, 6.5, 8);
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 });
  const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

  for (let pos = -90; pos <= 90; pos += 30) {
    [[-11, pos], [11, pos], [pos, -11], [pos, 11]].forEach(([x, z]) => {
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(x, 3.25, z);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.42, 10, 10), bulbMat);
      bulb.position.set(x, 6.6, z);
      scene.add(pole, bulb);
    });
  }

  // Roadside Trees
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21 });
  const leafMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 });
  [[-15, -22], [15, -48], [-48, 15], [48, -15], [-82, -15], [82, 15]].forEach(([tx, tz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.4, 8), trunkMat);
    trunk.position.set(tx, 1.2, tz);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.8, 10), leafMat);
    crown.position.set(tx, 4.2, tz);
    scene.add(trunk, crown);
  });

  // Boost Strips on Town Roads
  const padGeo = new THREE.BoxGeometry(3.4, 0.08, 5.2);
  const padMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
  [[0, -54], [0, 54], [-54, 0], [54, 0]].forEach(([px, pz]) => {
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.set(px, 0.04, pz);
    scene.add(pad);
    roadBoostPads.push(pad);
  });
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
