import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const shell = document.getElementById('thermal-3d-shell');
const canvas = document.getElementById('thermal-3d-canvas');
const fallback = document.getElementById('thermal-3d-fallback');
const readout = document.getElementById('thermal-component-readout');

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

async function initViewer() {
  const response = await fetch('/control/data/terra-thermal-summary.json', {
    credentials: 'same-origin',
    headers: { accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Geometry request failed: ${response.status}`);
  const payload = await response.json();
  const model = payload.geometry;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'low-power',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x071014, 0.055);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.05, 50);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = false;
  controls.minDistance = 3.4;
  controls.maxDistance = 10;
  controls.target.set(0, 0, 0);
  controls.addEventListener('change', render);

  scene.add(new THREE.HemisphereLight(0xd9fbff, 0x101316, 1.6));
  const key = new THREE.DirectionalLight(0xffffff, 2.1);
  key.position.set(-3, 5, 4);
  scene.add(key);
  const violet = new THREE.DirectionalLight(0xa98be0, 1.1);
  violet.position.set(4, 1, -3);
  scene.add(violet);

  const root = new THREE.Group();
  root.name = 'Terra Spine 3';
  scene.add(root);
  addDeskAndFeet(root, model.case);
  addCase(root, model.case);

  const selectable = [];
  const movable = [];
  const parts = new Map(model.components.map((component) => [component.id, component]));
  const componentGroups = new Map();
  const palette = {
    GPU: 0x52d9ff,
    MOTHERBOARD: 0xc9ff3d,
    CPU_COOLER_ENVELOPE: 0x67e8c4,
    PSU_REFERENCE: 0xa98be0,
    BOTTOM_FAN: 0xff8f66,
    TOP_CUSTOM_FAN: 0xff8f66,
    CABLE_ZONE: 0x9aa8ad,
  };

  for (const component of model.components) {
    const group = addComponent(root, component, palette[component.id] || 0xffffff, selectable);
    componentGroups.set(component.id, group);
    movable.push(group);
  }
  addGpuFans(componentGroups.get('GPU'), parts.get('GPU'), selectable);
  addCaseFan(componentGroups.get('TOP_CUSTOM_FAN'), parts.get('TOP_CUSTOM_FAN'), 0xff8f66, selectable);
  addCaseFan(componentGroups.get('BOTTOM_FAN'), parts.get('BOTTOM_FAN'), 0xff8f66, selectable);
  addCpuFan(componentGroups.get('CPU_COOLER_ENVELOPE'), parts.get('CPU_COOLER_ENVELOPE'), selectable);
  addCpuIntakeGuide(componentGroups.get('CPU_COOLER_ENVELOPE'), parts.get('CPU_COOLER_ENVELOPE'), selectable);
  addPsuFan(componentGroups.get('PSU_REFERENCE'), parts.get('PSU_REFERENCE'), selectable);
  addAirflow(componentGroups, parts);

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown = null;
  canvas.addEventListener('pointerdown', (event) => {
    pointerDown = [event.clientX, event.clientY];
  });
  canvas.addEventListener('pointerup', (event) => {
    if (!pointerDown || Math.hypot(event.clientX - pointerDown[0], event.clientY - pointerDown[1]) > 5) return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectable, false)[0];
    if (hit?.object.userData.component) showComponent(hit.object.userData.component);
  });

  const cameraPresets = {
    iso: { position: [5.4, 3.5, 4.4], target: [0, 0, 0] },
    gpu: { position: [0, 0.35, -6.2], target: [0, 0, 0] },
    board: { position: [0, 0.35, 6.2], target: [0, 0, 0] },
    top: { position: [0, 7.2, 0.01], target: [0, 0, 0] },
  };
  document.querySelectorAll('[data-thermal-camera]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-thermal-camera]').forEach((peer) => {
        const active = peer === button;
        peer.classList.toggle('active', active);
        peer.setAttribute('aria-pressed', String(active));
      });
      setCamera(cameraPresets[button.dataset.thermalCamera]);
    });
  });

  const explodeButton = document.querySelector('[data-thermal-explode]');
  explodeButton?.addEventListener('click', () => {
    const active = explodeButton.getAttribute('aria-pressed') !== 'true';
    explodeButton.setAttribute('aria-pressed', String(active));
    explodeButton.classList.toggle('active', active);
    movable.forEach((part) => {
      const direction = part.userData.explodeDirection;
      part.position.copy(part.userData.basePosition);
      if (active) part.position.add(direction);
    });
    render();
  });

  function setCamera(preset) {
    camera.position.fromArray(preset.position);
    controls.target.fromArray(preset.target);
    controls.update();
    render();
  }

  function resize() {
    const width = Math.max(shell.clientWidth, 1);
    const height = Math.max(shell.clientHeight, 1);
    const pixelRatio = renderer.getPixelRatio();
    if (canvas.width !== Math.floor(width * pixelRatio) || canvas.height !== Math.floor(height * pixelRatio)) {
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    render();
  }

  function render() {
    renderer.render(scene, camera);
  }

  new ResizeObserver(resize).observe(shell);
  setCamera(cameraPresets.iso);
  resize();
}

const SCALE = 0.01;
const CASE = { x: 343, y: 153, z: 198 };

function worldBox(box) {
  const [x, y, z] = box.min;
  const [sx, sy, sz] = box.size;
  return {
    center: new THREE.Vector3(
      (x + sx / 2 - CASE.x / 2) * SCALE,
      (z + sz / 2 - CASE.z / 2) * SCALE,
      (y + sy / 2 - CASE.y / 2) * SCALE,
    ),
    size: new THREE.Vector3(sx * SCALE, sz * SCALE, sy * SCALE),
  };
}

function addComponent(root, component, color, selectable) {
  const { center, size } = worldBox(component.box);
  const group = new THREE.Group();
  group.position.copy(center);
  group.userData.basePosition = center.clone();
  const explodeOffsets = {
    GPU: [0, 0, -1.15],
    MOTHERBOARD: [0.15, 0, 1.0],
    CPU_COOLER_ENVELOPE: [0.3, 0.05, 1.65],
    PSU_REFERENCE: [-0.25, 0.05, 1.35],
    BOTTOM_FAN: [-2.2, -0.12, 1.8],
    TOP_CUSTOM_FAN: [0, 1.15, 0],
    CABLE_ZONE: [-0.1, 0.35, 0.75],
  };
  group.userData.explodeDirection = new THREE.Vector3(...(explodeOffsets[component.id] || [0, 0, 0.8]));

  const isCable = component.id === 'CABLE_ZONE';
  const material = new THREE.MeshStandardMaterial({
    color,
    transparent: true,
    opacity: isCable ? 0.07 : 0.18,
    roughness: 0.5,
    metalness: 0.15,
    depthWrite: false,
  });
  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.component = component;
  selectable.push(mesh);
  group.add(mesh);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity: isCable ? 0.45 : 0.9 }),
  );
  group.add(edges);
  root.add(group);
  return group;
}

function addCase(root) {
  const geometry = new THREE.BoxGeometry(CASE.x * SCALE, CASE.z * SCALE, CASE.y * SCALE);
  root.add(new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0x93a88d, transparent: true, opacity: 0.9 }),
  ));

  const panelMaterial = new THREE.MeshStandardMaterial({
    color: 0x667a66,
    transparent: true,
    opacity: 0.075,
    roughness: 0.85,
    metalness: 0.25,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const top = new THREE.Mesh(new THREE.PlaneGeometry(3.33, 1.43), panelMaterial);
  top.rotation.x = -Math.PI / 2;
  top.position.y = 0.99;
  root.add(top);

  const slatMaterial = new THREE.MeshBasicMaterial({ color: 0xa4b9a0, transparent: true, opacity: 0.38 });
  for (let i = 0; i < 28; i += 1) {
    const x = -1.55 + i * 0.115;
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.012, 1.28), slatMaterial);
    slat.position.set(x, 1.005, 0);
    root.add(slat);
  }
  for (const side of [-1, 1]) {
    for (let i = 0; i < 24; i += 1) {
      const x = -1.5 + i * 0.13;
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.025, 1.62, 0.012), slatMaterial);
      slat.position.set(x, 0, side * 0.77);
      root.add(slat);
    }
  }
}

function addDeskAndFeet(root) {
  const desk = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 3.2),
    new THREE.MeshStandardMaterial({ color: 0x1b2427, roughness: 0.95, metalness: 0 }),
  );
  desk.rotation.x = -Math.PI / 2;
  desk.position.y = -1.2;
  root.add(desk);
  const footMaterial = new THREE.MeshStandardMaterial({ color: 0x252d2f, roughness: 0.8 });
  for (const x of [-1.35, 1.35]) {
    for (const z of [-0.58, 0.58]) {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.22), footMaterial);
      foot.position.set(x, -1.09, z);
      root.add(foot);
    }
  }
}

function addGpuFans(parent, gpu, selectable) {
  if (!parent || !gpu?.cooling_fans) return;
  const color = 0x52d9ff;
  const gpuWorld = worldBox(gpu.box).center;
  for (const [localX, , localZ] of gpu.cooling_fans.approximate_centres_local_mm) {
    const component = { ...gpu, label: `${gpu.label} · 90 mm intake fan` };
    const group = makeFan(0.45, 0.055, color, component, selectable);
    group.rotation.x = Math.PI / 2;
    const worldPosition = new THREE.Vector3(
      (gpu.box.min[0] + localX - CASE.x / 2) * SCALE,
      (gpu.box.min[2] + localZ - CASE.z / 2) * SCALE,
      (gpu.box.min[1] - CASE.y / 2 - 2) * SCALE,
    );
    group.position.copy(worldPosition.sub(gpuWorld));
    parent.add(group);
  }
}

function addCaseFan(parent, component, color, selectable) {
  if (!parent || !component) return;
  const fan = makeFan(0.58, component.box.size[2] * SCALE * 0.45, color, component, selectable);
  parent.add(fan);
}

function addCpuFan(parent, cooler, selectable) {
  if (!parent || !cooler) return;
  const { center } = worldBox(cooler.box);
  const fan = makeFan(0.57, 0.055, 0x67e8c4, { ...cooler, label: 'CPU side intake fan and guide' }, selectable);
  fan.rotation.x = Math.PI / 2;
  fan.position.set(0, 0, 0.73 - center.z);
  parent.add(fan);
}

function addCpuIntakeGuide(parent, cooler, selectable) {
  if (!parent || !cooler) return;
  const component = {
    ...cooler,
    label: 'Existing CPU intake flow-straightening guide',
    status: 'user-confirmed baseline hardware; exact dimensions pending',
  };
  const material = new THREE.MeshStandardMaterial({
    color: 0x67e8c4,
    transparent: true,
    opacity: 0.2,
    roughness: 0.35,
    metalness: 0,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const duct = new THREE.Mesh(
    new THREE.CylinderGeometry(0.62, 0.57, 0.12, 36, 1, true),
    material,
  );
  duct.rotation.x = Math.PI / 2;
  duct.position.set(0, 0, 0.40);
  duct.userData.component = component;
  selectable.push(duct);
  parent.add(duct);

  const outerRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.62, 0.018, 8, 40),
    new THREE.MeshBasicMaterial({ color: 0x67e8c4, transparent: true, opacity: 0.8 }),
  );
  outerRim.position.set(0, 0, 0.46);
  outerRim.userData.component = component;
  selectable.push(outerRim);
  parent.add(outerRim);
}

function addPsuFan(parent, psu, selectable) {
  if (!parent || !psu) return;
  const { center } = worldBox(psu.box);
  const component = { ...psu, label: 'PSU side intake fan · 92 mm assumed' };
  const fan = makeFan(0.44, 0.05, 0x52d9ff, component, selectable);
  fan.rotation.x = Math.PI / 2;
  fan.position.set(0, 0, 0.73 - center.z);
  parent.add(fan);
}

function makeFan(radius, depth, color, component, selectable) {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.028, 8, 40),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.userData.component = component;
  selectable.push(ring);
  group.add(ring);
  const hub = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.13, radius * 0.13, Math.max(depth, 0.02), 18),
    new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.75 }),
  );
  hub.userData.component = component;
  selectable.push(hub);
  group.add(hub);
  for (let i = 0; i < 7; i += 1) {
    const pivot = new THREE.Group();
    pivot.rotation.y = i * Math.PI * 2 / 7;
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(radius * 0.56, 0.018, radius * 0.12),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 }),
    );
    blade.position.x = radius * 0.31;
    blade.rotation.y = 0.28;
    pivot.add(blade);
    group.add(pivot);
  }
  return group;
}

function addAirflow(componentGroups, parts) {
  const arrows = [];
  const gpu = parts.get('GPU');
  if (gpu?.cooling_fans) {
    for (const [localX, , localZ] of gpu.cooling_fans.approximate_centres_local_mm) {
      arrows.push([
        'GPU',
        [
          (gpu.box.min[0] + localX - CASE.x / 2) * SCALE,
          (gpu.box.min[2] + localZ - CASE.z / 2) * SCALE,
          -1.38,
        ],
        [0, 0, 1], 0x52d9ff, 0.48,
      ]);
    }
  }

  for (const id of ['CPU_COOLER_ENVELOPE', 'PSU_REFERENCE']) {
    const component = parts.get(id);
    if (!component) continue;
    const { center } = worldBox(component.box);
    arrows.push([id, [center.x, center.y, 1.38], [0, 0, -1], 0x52d9ff, 0.48]);
  }

  const top = parts.get('TOP_CUSTOM_FAN');
  const bottom = parts.get('BOTTOM_FAN');
  if (top) {
    const { center } = worldBox(top.box);
    arrows.push(['TOP_CUSTOM_FAN', [center.x, 0.78, center.z], [0, 1, 0], 0xff8f66, 0.52]);
  }
  if (bottom) {
    const { center } = worldBox(bottom.box);
    arrows.push(['BOTTOM_FAN', [center.x, -0.78, center.z], [0, -1, 0], 0xff8f66, 0.52]);
  }

  for (const [componentId, origin, direction, color, length] of arrows) {
    const parent = componentGroups.get(componentId);
    if (!parent) continue;
    const localOrigin = new THREE.Vector3(...origin).sub(parent.userData.basePosition);
    parent.add(makeFlowArrow(localOrigin, new THREE.Vector3(...direction), length, color));
  }
}

function makeFlowArrow(origin, direction, length, color) {
  const arrow = new THREE.Group();
  const headLength = 0.14;
  const shaftLength = Math.max(0.05, length - headLength);
  const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, shaftLength, 10), material);
  shaft.position.y = shaftLength / 2;
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.065, headLength, 14), material);
  head.position.y = shaftLength + headLength / 2;
  arrow.add(shaft, head);
  arrow.position.copy(origin);
  arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  return arrow;
}

function showComponent(component) {
  const size = component.box?.size?.map((value) => Number(value).toFixed(value % 1 ? 1 : 0)).join(' × ');
  readout.innerHTML = `<small>${escapeHtml(component.id.replaceAll('_', ' '))}</small><strong>${escapeHtml(component.label)}</strong><span>${size ? `${size} mm · ` : ''}${escapeHtml(component.status || '')}</span>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}
