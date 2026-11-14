import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

// Visor 3D del Fractal Terra. Todo sale de `geometry` en terra-thermal-summary.json
// (lo genera tools/terra-cfd/build_geometry.py). Ejes del dato: x delante→detrás,
// y panel de la gráfica→panel del procesador, z suelo→arriba (mm).

const shell = document.getElementById('thermal-3d-shell');
const canvas = document.getElementById('thermal-3d-canvas');
const fallback = document.getElementById('thermal-3d-fallback');
const readout = document.getElementById('thermal-component-readout');
const legendBox = document.getElementById('thermal-3d-legend');

const S = 0.01;
let CASE = { x: 343, y: 153, z: 198 };

// Colour by what each part does…
const ROLE = {
  heat: { color: 0xff8f66, label: 'Heat source' },
  fan: { color: 0x52d9ff, label: 'Fan' },
  duct: { color: 0x2ec4a6, label: 'Printed duct' },
  structure: { color: 0x9fb2bb, label: 'Structure' },
  porous: { color: 0x8a969c, label: 'Cables / grille' },
};
// …or by how sure we are of where it is.
const CERTAINTY = {
  measured: { color: 0xc9ff3d, label: 'Measured / official' },
  official: { color: 0xc9ff3d, label: 'Measured / official' },
  photo: { color: 0x52d9ff, label: 'From photos' },
  assumed: { color: 0xa98be0, label: 'Assumed' },
};
const HEAT_TINT = { GPU: 0xff8f66, CPU_COOLER: 0xff6f4f, RAM: 0xf2c14e, PSU: 0xffb36b };
const AIR_IN = 0x52d9ff;
const AIR_OUT = 0xff8f66;

if (shell && canvas) {
  let initialized = false;
  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting) && !initialized) {
      initialized = true;
      observer.disconnect();
      initViewer().catch((error) => {
        console.error('Terra 3D viewer:', error);
        canvas.hidden = true;
        fallback.hidden = false;
      });
    }
  }, { rootMargin: '120px' });
  observer.observe(shell);
}

// mm del dato → mundo (Y arriba)
const P = (x, y, z) => new THREE.Vector3((x - CASE.x / 2) * S, (z - CASE.z / 2) * S, (y - CASE.y / 2) * S);
const boxCentre = (b) => P(b.min[0] + b.size[0] / 2, b.min[1] + b.size[1] / 2, b.min[2] + b.size[2] / 2);
const boxSize = (b) => [b.size[0] * S, b.size[2] * S, b.size[1] * S];

async function initViewer() {
  const response = await fetch('/control/data/terra-thermal-summary.json', {
    credentials: 'same-origin',
    headers: { accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Geometry request failed: ${response.status}`);
  const model = (await response.json()).geometry;
  const [cx, cy, cz] = model.case.outer_body_mm;
  CASE = { x: cx, y: cy, z: cz };

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 60);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.minDistance = 2.2;
  controls.maxDistance = 11;
  controls.addEventListener('change', render);

  scene.add(new THREE.HemisphereLight(0xe6fbff, 0x10171a, 1.7));
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xa98be0, 0.9);
  rim.position.set(4, 1, -3);
  scene.add(rim);

  const root = new THREE.Group();
  scene.add(root);
  const selectable = [];
  const colorables = [];
  const explodables = [];
  const panelGroup = new THREE.Group();
  root.add(panelGroup);

  const tint = (part, mode) => {
    if (mode === 'certainty') return (CERTAINTY[part.certainty] || CERTAINTY.assumed).color;
    if (part.role === 'heat') return HEAT_TINT[part.id] ?? ROLE.heat.color;
    return (ROLE[part.role] || ROLE.structure).color;
  };
  const mat = (part, opts = {}) => {
    const opacity = opts.opacity ?? 0.35;
    const material = opts.line
      ? new THREE.LineBasicMaterial({ transparent: true, opacity })
      : new THREE.MeshStandardMaterial({
        transparent: opacity < 1, opacity, roughness: 0.55, metalness: 0.15,
        depthWrite: opacity > 0.7, side: opts.side ?? THREE.FrontSide,
      });
    material.color.setHex(tint(part, 'role'));
    colorables.push({ material, part });
    return material;
  };
  const pick = (mesh, part) => {
    mesh.userData.part = part;
    selectable.push(mesh);
    return mesh;
  };

  addDesk(root, model.case);
  addCaseFrame(root);
  for (const panel of model.panels || []) addPanel(panelGroup, panel);

  const OFFSETS = {
    GPU: [0, 0, -1.2], GPU_FAN_1: [0, 0, -1.2], GPU_FAN_2: [0, 0, -1.2], GPU_FAN_3: [0, 0, -1.2],
    GPU_DUCT: [0, 0, -2.05], SPINE: [0, 0, -0.35], RISER: [0, -0.35, -0.9],
    MOTHERBOARD: [0, 0, 0.45], RAM: [0, 0.15, 1.0], CPU_COOLER: [0, 0, 1.2], CPU_FAN: [0, 0, 1.2],
    CPU_DUCT: [0, 0, 2.05], PSU: [-0.35, 0, 1.3], PSU_FAN: [-0.35, 0, 1.3],
    BOTTOM_FAN: [0, -0.9, 0], BOTTOM_GRILLE: [0, -0.55, 0], TOP_FAN: [0, 0.9, 0],
    CABLES_GPU: [-0.5, 0, -0.85], CABLES_MAIN: [0, 0.1, 0.75], CABLES_BOTTOM: [0, -0.45, 0.75],
  };
  for (const part of model.components) {
    const group = new THREE.Group();
    group.userData.offset = new THREE.Vector3(...(OFFSETS[part.id] || [0, 0, 0]));
    root.add(group);
    explodables.push(group);
    if (part.fan) addFan(group, part, mat, pick);
    else if (part.shape?.type === 'rings') addGpuDuct(group, part, mat, pick);
    else if (part.shape?.type === 'tube') addCpuDuct(group, part, mat, pick);
    else if (part.shape?.type === 'disc_grille') addDiscGrille(group, part, mat, pick);
    else if (part.role === 'porous') addCables(group, part, mat, pick);
    else if (part.id === 'RAM') addRam(group, part, mat, pick);
    else if (part.id === 'SPINE') addSpine(group, part, mat, pick);
    else if (part.id === 'CPU_COOLER') addCooler(group, part, mat, pick);
    else addBlock(group, part, mat, pick);
  }

  const flow = new THREE.Group();
  root.add(flow);
  addAirflow(flow, model);

  // ---------- UI ----------
  let mode = 'role';
  function renderLegend() {
    if (!legendBox) return;
    const entries = mode === 'certainty'
      ? [CERTAINTY.measured, CERTAINTY.photo, CERTAINTY.assumed]
      : [ROLE.heat, ROLE.fan, ROLE.duct, ROLE.structure, ROLE.porous];
    legendBox.setAttribute('aria-label', mode === 'certainty' ? 'How sure each position is' : 'What each part does');
    legendBox.innerHTML = entries.map(({ label, color }) => `<span><i style="background:#${color.toString(16).padStart(6, '0')}"></i>${label}</span>`).join('');
  }
  const toggle = (selector, onClick) => document.querySelectorAll(selector).forEach((button) => button.addEventListener('click', () => onClick(button)));
  const setPressed = (button, on) => { button.setAttribute('aria-pressed', String(on)); button.classList.toggle('active', on); };

  toggle('[data-thermal-colour]', (button) => {
    document.querySelectorAll('[data-thermal-colour]').forEach((peer) => setPressed(peer, peer === button));
    mode = button.dataset.thermalColour;
    for (const { material, part } of colorables) material.color.setHex(tint(part, mode));
    renderLegend();
    render();
  });
  const panelsButton = document.querySelector('[data-thermal-panels]');
  panelGroup.visible = panelsButton ? panelsButton.getAttribute('aria-pressed') === 'true' : true;
  toggle('[data-thermal-panels]', (button) => {
    const on = button.getAttribute('aria-pressed') !== 'true';
    setPressed(button, on);
    panelGroup.visible = on;
    render();
  });
  toggle('[data-thermal-flow]', (button) => {
    const on = button.getAttribute('aria-pressed') !== 'true';
    setPressed(button, on);
    flow.visible = on;
    render();
  });
  toggle('[data-thermal-explode]', (button) => {
    const on = button.getAttribute('aria-pressed') !== 'true';
    setPressed(button, on);
    for (const group of explodables) group.position.copy(on ? group.userData.offset : new THREE.Vector3());
    flow.visible = !on && (document.querySelector('[data-thermal-flow]')?.getAttribute('aria-pressed') ?? 'true') !== 'false';
    render();
  });

  const presets = {
    iso: [4.6, 3.1, 4.3],
    gpu: [0, 0.3, -5.6],
    board: [0, 0.3, 5.6],
    top: [0, 6.4, 0.01],
  };
  toggle('[data-thermal-camera]', (button) => {
    document.querySelectorAll('[data-thermal-camera]').forEach((peer) => setPressed(peer, peer === button));
    setCamera(presets[button.dataset.thermalCamera]);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let down = null;
  canvas.addEventListener('pointerdown', (event) => { down = [event.clientX, event.clientY]; });
  canvas.addEventListener('pointerup', (event) => {
    if (!down || Math.hypot(event.clientX - down[0], event.clientY - down[1]) > 5) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectable, false).find((h) => isVisible(h.object));
    if (hit) showPart(hit.object.userData.part);
  });

  function setCamera(position) {
    camera.position.fromArray(position);
    controls.target.set(0, 0, 0);
    controls.update();
    render();
  }
  function resize() {
    const width = Math.max(shell.clientWidth, 1);
    const height = Math.max(shell.clientHeight, 1);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }
  function render() { renderer.render(scene, camera); }

  renderLegend();
  new ResizeObserver(resize).observe(shell);
  setCamera(presets.iso);
  resize();
  window.__terraViewer = { scene, camera, render, setCamera };
}

function isVisible(object) {
  for (let node = object; node; node = node.parent) if (!node.visible) return false;
  return true;
}

// ---------- Case ----------
function addDesk(root, kase) {
  const feet = kase.feet_mm || 20;
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 3.4), new THREE.MeshStandardMaterial({ color: 0x1a2326, roughness: 0.95 }));
  desk.rotation.x = -Math.PI / 2;
  desk.position.copy(P(CASE.x / 2, CASE.y / 2, -feet));
  root.add(desk);
  const footMaterial = new THREE.MeshStandardMaterial({ color: 0x2a3335, roughness: 0.8 });
  for (const x of [22, CASE.x - 22]) {
    for (const y of [18, CASE.y - 18]) {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, feet * S, 20), footMaterial);
      foot.position.copy(P(x, y, -feet / 2));
      root.add(foot);
    }
  }
}

function addCaseFrame(root) {
  const geometry = new THREE.BoxGeometry(CASE.x * S, CASE.z * S, CASE.y * S);
  root.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0x9fbf98, transparent: true, opacity: 0.85 })));
  const walnut = new THREE.Mesh(
    new THREE.BoxGeometry(0.03, CASE.z * S * 0.98, CASE.y * S * 0.98),
    new THREE.MeshStandardMaterial({ color: 0x7a4d2a, roughness: 0.7, transparent: true, opacity: 0.6 }),
  );
  walnut.position.copy(P(-1.5, CASE.y / 2, CASE.z / 2));
  root.add(walnut);
}

function addPanel(group, panel) {
  const g = panel.grille;
  if (!g) return;
  const material = new THREE.MeshStandardMaterial({
    color: 0x86a58a, transparent: true, opacity: 0.22, roughness: 0.8, metalness: 0.3,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const rect = (w, h) => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(w, 0); shape.lineTo(w, h); shape.lineTo(0, h); shape.lineTo(0, 0);
    return shape;
  };
  let mesh;
  if (panel.face === 'y-' || panel.face === 'y+') {
    const shape = rect(CASE.x, CASE.z);
    g.rows_x.forEach((x, k) => {
      const gap = k % 2 === 0 ? g.gap_z.even : g.gap_z.odd;
      for (const [z0, z1] of [[g.slot_z[0], gap[0]], [gap[1], g.slot_z[1]]]) shape.holes.push(slotPath(x, z0, z1, g.slot_w));
    });
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 4), material);
    mesh.position.copy(P(0, panel.face === 'y-' ? -0.5 : CASE.y + 0.5, 0));
  } else if (panel.face === 'z+') {
    const shape = rect(CASE.x, CASE.y);
    for (let x = g.x_range[0]; x <= g.x_range[1]; x += g.pitch) shape.holes.push(slotPath(x, g.y_range[0], g.y_range[1], g.slot_w));
    mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 4), material);
    mesh.rotation.x = Math.PI / 2;
    mesh.position.copy(P(0, 0, CASE.z + 0.5));
  }
  if (!mesh) return;
  mesh.scale.setScalar(S);
  group.add(mesh);
}

// Ranura con extremos redondos centrada en x, de a a b (coordenadas del plano del panel)
function slotPath(x, a, b, w) {
  const r = w / 2;
  const path = new THREE.Path();
  path.moveTo(x - r, a + r);
  path.lineTo(x - r, b - r);
  path.absarc(x, b - r, r, Math.PI, 0, true);
  path.lineTo(x + r, a + r);
  path.absarc(x, a + r, r, 0, Math.PI, true);
  return path;
}

// ---------- Parts ----------
function addBlock(group, part, mat, pick, opacity = 0.32) {
  const geometry = new THREE.BoxGeometry(...boxSize(part.box));
  const mesh = pick(new THREE.Mesh(geometry, mat(part, { opacity })), part);
  mesh.position.copy(boxCentre(part.box));
  group.add(mesh);
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), mat(part, { line: true, opacity: 0.9 }));
  edges.position.copy(mesh.position);
  group.add(edges);
}

function addCooler(group, part, mat, pick) {
  addBlock(group, part, mat, pick, 0.18);
  const b = part.box;
  const fins = 18;
  const finDepth = b.size[1] - 18;
  const finGeometry = new THREE.BoxGeometry(0.006, b.size[2] * S * 0.94, finDepth * S);
  const material = mat(part, { opacity: 0.6 });
  for (let i = 0; i < fins; i += 1) {
    const fin = pick(new THREE.Mesh(finGeometry, material), part);
    fin.position.copy(P(b.min[0] + 4 + i * (b.size[0] - 8) / (fins - 1), b.min[1] + 3 + finDepth / 2, b.min[2] + b.size[2] / 2));
    group.add(fin);
  }
}

function addRam(group, part, mat, pick) {
  const b = part.box;
  for (const dx of [1.5, 9.5]) addBlock(group, { ...part, box: { min: [b.min[0] + dx, b.min[1], b.min[2]], size: [6, b.size[1], b.size[2]] } }, mat, pick, 0.6);
}

function addSpine(group, part, mat, pick) {
  const b = part.box;
  const shape = new THREE.Shape();
  shape.moveTo(0, 0); shape.lineTo(b.size[0], 0); shape.lineTo(b.size[0], b.size[2]); shape.lineTo(0, b.size[2]); shape.lineTo(0, 0);
  for (const [x0, z0, x1, z1] of [[150, 22, 332, 180], [14, 28, 132, 176]]) {
    const hole = new THREE.Path();
    hole.moveTo(x0, z0); hole.lineTo(x1, z0); hole.lineTo(x1, z1); hole.lineTo(x0, z1); hole.lineTo(x0, z0);
    shape.holes.push(hole);
  }
  const mesh = pick(new THREE.Mesh(new THREE.ShapeGeometry(shape), mat(part, { opacity: 0.18, side: THREE.DoubleSide })), part);
  mesh.scale.setScalar(S);
  mesh.position.copy(P(b.min[0], b.min[1] + b.size[1] / 2, b.min[2]));
  group.add(mesh);
}

function addFan(group, part, mat, pick) {
  const f = part.fan;
  const r = (f.diameter / 2) * S;
  const fanGroup = new THREE.Group();
  fanGroup.add(pick(new THREE.Mesh(new THREE.TorusGeometry(r, 0.02, 8, 48), mat(part, { opacity: 0.95 })), part));
  fanGroup.add(pick(new THREE.Mesh(new THREE.CircleGeometry(r, 40), mat(part, { opacity: 0.07, side: THREE.DoubleSide })), part));
  const hub = pick(new THREE.Mesh(new THREE.CylinderGeometry(r * f.hub_ratio, r * f.hub_ratio, Math.max(f.thickness * S, 0.03), 20), mat(part, { opacity: 0.85 })), part);
  hub.rotation.x = Math.PI / 2;
  fanGroup.add(hub);
  const bladeMaterial = mat(part, { opacity: 0.5, side: THREE.DoubleSide });
  for (let i = 0; i < 7; i += 1) {
    const pivot = new THREE.Group();
    pivot.rotation.z = (i * Math.PI * 2) / 7;
    const blade = new THREE.Mesh(new THREE.PlaneGeometry(r * (0.95 - f.hub_ratio), r * 0.22), bladeMaterial);
    blade.position.x = r * (f.hub_ratio + 0.95) / 2;
    blade.rotation.x = 0.55;
    pivot.add(pick(blade, part));
    fanGroup.add(pivot);
  }
  fanGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dataAxis(f.axis));
  fanGroup.position.copy(P(...f.centre));
  group.add(fanGroup);
}

const dataAxis = (a) => new THREE.Vector3(a[0], a[2], a[1]).normalize();

function ringGeometry(rOut, rIn, depth) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, rOut, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, rIn, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 48 });
}
// Extruido en +Z local = +y del dato (de la rejilla hacia dentro)
function ringMesh(geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.scale.setScalar(S);
  mesh.position.copy(P(x, y, z));
  return mesh;
}

function addGpuDuct(group, part, mat, pick) {
  const s = part.shape;
  const y0 = part.box.min[1];
  const material = mat(part, { opacity: 0.9 });
  const wall = ringGeometry(s.r_out, s.r_in, s.height);
  const flange = ringGeometry(s.flange_r, s.r_in, s.flange_t);
  for (const x of s.centres_x) {
    group.add(pick(ringMesh(wall, material, x, y0, s.centre_z), part));
    group.add(pick(ringMesh(flange, material, x, y0, s.centre_z), part));
    for (const dz of s.ears_z) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(16 * S, 13 * S, 2 * S), material);
      ear.position.copy(P(x, y0 + 1, s.centre_z + dz));
      group.add(pick(ear, part));
    }
  }
  for (let i = 0; i < s.centres_x.length - 1; i += 1) {
    const web = new THREE.Mesh(new THREE.BoxGeometry((s.centres_x[i + 1] - s.centres_x[i] - 2 * s.r_in + 3) * S, 30 * S, s.height * S), material);
    web.position.copy(P((s.centres_x[i] + s.centres_x[i + 1]) / 2, y0 + s.height / 2, s.centre_z));
    group.add(pick(web, part));
  }
}

function addCpuDuct(group, part, mat, pick) {
  const s = part.shape;
  const material = mat(part, { opacity: 0.9 });
  const yPanel = part.box.min[1] + part.box.size[1];
  group.add(pick(ringMesh(ringGeometry(s.r_out, s.r_in, s.height), material, s.centre_x, part.box.min[1], s.centre_z), part));
  group.add(pick(ringMesh(ringGeometry(s.flange_r, s.r_in, s.flange_t), material, s.centre_x, yPanel - s.flange_t, s.centre_z), part));
  for (const dx of s.ears_x) {
    const length = Math.abs(dx) - s.r_out + 8;
    const ear = new THREE.Mesh(new THREE.BoxGeometry(length * S, 16 * S, 2 * S), material);
    ear.position.copy(P(s.centre_x + Math.sign(dx) * (s.r_out + length / 2 - 4), yPanel - 1, s.centre_z));
    group.add(pick(ear, part));
  }
}

function addDiscGrille(group, part, mat, pick) {
  const s = part.shape;
  const material = mat(part, { opacity: 0.9 });
  const centre = P(...s.centre);
  for (let i = 1; i <= s.rings; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry((s.diameter / 2) * (i / s.rings) * S, 0.006, 6, 48), material);
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(centre);
    group.add(pick(ring, part));
  }
  for (let i = 0; i < 4; i += 1) {
    const wire = new THREE.Mesh(new THREE.BoxGeometry(s.diameter * S, 0.008, 0.008), material);
    wire.rotation.y = (i * Math.PI) / 4;
    wire.position.copy(centre);
    group.add(pick(wire, part));
  }
}

// Mazos de cables: un volumen poroso y unos cuantos cables con una semilla fija (no son los reales)
function addCables(group, part, mat, pick) {
  const b = part.box;
  const volume = new THREE.Mesh(new THREE.BoxGeometry(...boxSize(b)), mat(part, { opacity: 0.05 }));
  volume.position.copy(boxCentre(b));
  group.add(pick(volume, part));
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(volume.geometry), mat(part, { line: true, opacity: 0.35 }));
  edges.position.copy(volume.position);
  group.add(edges);
  let seed = [...part.id].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  // Un mazo: cables casi paralelos a lo largo del lado más largo, con una ondulación suave
  const material = mat(part, { opacity: 0.8 });
  const long = b.size.indexOf(Math.max(...b.size));
  const across = [0, 1, 2].filter((axis) => axis !== long);
  const count = 7;
  for (let i = 0; i < count; i += 1) {
    const base = across.map(() => 0.3 + 0.4 * rnd());
    const phase = rnd() * Math.PI * 2;
    const points = [];
    for (let k = 0; k <= 8; k += 1) {
      const t = k / 8;
      const p = [0, 0, 0];
      p[long] = b.min[long] + (0.04 + 0.92 * t) * b.size[long];
      across.forEach((axis, j) => {
        const wobble = 0.12 * Math.sin(phase + t * Math.PI * (2 + j));
        p[axis] = b.min[axis] + Math.min(0.92, Math.max(0.08, base[j] + wobble)) * b.size[axis];
      });
      points.push(P(...p));
    }
    group.add(pick(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 48, 0.03, 8, false), material), part));
  }
}

// ---------- Airflow ----------
function addAirflow(flow, model) {
  for (const part of model.components) {
    if (!part.fan) continue;
    const f = part.fan;
    const axis = dataAxis(f.axis);
    let origin;
    if (part.id.startsWith('GPU_FAN')) origin = P(f.centre[0], -45, f.centre[2]);
    else if (part.id === 'CPU_FAN') origin = P(f.centre[0], CASE.y + 45, f.centre[2]);
    else if (part.id === 'PSU_FAN') origin = P(f.centre[0], CASE.y + 35, f.centre[2]);
    else origin = P(...f.centre).add(axis.clone().multiplyScalar(0.18));
    flow.add(arrow(origin, axis, 0.45, f.flow === 'intake' ? AIR_IN : AIR_OUT));
  }
}

function arrow(origin, direction, length, color) {
  const group = new THREE.Group();
  const head = 0.13;
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, length - head, 10), material);
  shaft.position.y = (length - head) / 2;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.06, head, 14), material);
  cone.position.y = length - head / 2;
  group.add(shaft, cone);
  group.position.copy(origin);
  group.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return group;
}

// ---------- Readout ----------
const CERT_TEXT = { measured: 'Measured', official: 'Official spec', photo: 'From photos', assumed: 'Assumed · to measure' };
const ROLE_TEXT = { heat: 'Heat source', fan: 'Fan', duct: 'Printed duct', structure: 'Structure', porous: 'Porous · cables / grille' };
function showPart(part) {
  const size = part.box?.size?.map((v) => (Number.isInteger(v) ? v : v.toFixed(1))).join(' × ');
  const heat = part.heat_W ? ` · ~${part.heat_W} W` : '';
  readout.innerHTML = `<small>${esc(ROLE_TEXT[part.role] || '')} · ${esc(CERT_TEXT[part.certainty] || '')}</small>`
    + `<strong>${esc(part.label)}</strong>`
    + `<span>${size ? `${size} mm${heat} · ` : ''}${esc(part.basis || '')}</span>`;
}
function esc(value) {
  return String(value).replace(/[&<>'"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]);
}
