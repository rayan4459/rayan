/* ============================================================
   CurioLab — page principale
   Bague 3D procédurale (Three.js) + explorateur de fonctionnalités
   ============================================================ */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/RoomEnvironment.js';

/* ------------------------------------------------------------
   CONTENU — modifiez librement les textes / finitions ici
   ------------------------------------------------------------ */
const ENGRAVING = 'CurioLab';

const FINISHES = [
  { id: 'onyx',    label: 'Noir onyx',      band: '#1b1b1d', polish: '#0a0a0c', swatch: '#111113', engraving: '#e8e8ec' },
  { id: 'titane',  label: 'Titane naturel', band: '#8f9298', polish: '#c9ccd1', swatch: '#b9bcc2', engraving: '#2a2a2e' },
  { id: 'or',      label: 'Or rose',        band: '#c9977f', polish: '#e6bda8', swatch: '#dcae98', engraving: '#4a2e24' },
  { id: 'nuit',    label: 'Bleu nuit',      band: '#1e2b4d', polish: '#0f1730', swatch: '#1b2745', engraving: '#dfe6f7' },
];

const SIZES = ['6', '7', '8', '9', '10', '11', '12', '13'];

/* Chaque fonctionnalité définit :
   - title / text : contenu de la carte dépliée
   - pose : orientation de la bague (rx, ry, rz en radians), distance caméra, décalage (px, py)
   - spin : angle absolu du plateau tournant (sinon rotation lente continue)
   - kind : 'colors' | 'sizes' pour un contenu spécial dans la carte
   - nfc  : affiche l'animation d'ondes sans contact                      */
const FEATURES = [
  {
    id: 'couleurs', title: 'Finitions', kind: 'colors',
    text: 'Disponible en quatre finitions. La Curio Ring est présentée en',
    pose: { rx: 1.05, ry: 0.55, rz: 0.12, dist: 6.5, px: 0, py: 0 },
  },
  {
    id: 'titane', title: 'Titane brossé',
    text: 'Un anneau usiné dans un bloc de titane, brossé à la main, bordé de deux chanfreins polis miroir. Ultra résistant, ultra léger.',
    pose: { rx: 0.22, ry: 0, rz: 0.05, dist: 3.9, px: 0, py: 0.05 },
  },
  {
    id: 'paiement', title: 'Paiement sans contact', nfc: true,
    text: 'Une antenne NFC intégrée dans l’anneau. Approchez la main du terminal et le paiement est validé en moins d’une seconde, partout où le sans contact est accepté.',
    pose: { rx: 1.15, ry: 0.35, rz: 0, dist: 6.6, px: 0, py: 0 },
  },
  {
    id: 'batterie', title: 'Sans batterie',
    text: 'La bague est alimentée par le terminal au moment du paiement. Aucune recharge, aucun câble, aucune panne. Elle fonctionne pour toujours.',
    pose: { rx: 0.62, ry: -0.7, rz: -0.1, dist: 6.2, px: 0, py: 0 },
  },
  {
    id: 'etanche', title: 'Étanche 5 ATM',
    text: 'Douche, piscine, mer : gardez-la au doigt. Le titane et la céramique ne craignent ni l’eau, ni le sel, ni le temps.',
    pose: { rx: 0.9, ry: 0.95, rz: 0.15, dist: 6.0, px: 0, py: 0 },
  },
  {
    id: 'gravure', title: 'Gravure intérieure',
    text: 'Le nom CurioLab est gravé au laser à l’intérieur de l’anneau. Personnalisez-la avec vos initiales lors de la commande.',
    pose: { rx: 1.25, ry: 0.85, rz: 0, dist: 3.6, px: -0.35, py: 0.15 },
    spin: -0.9,
  },
  {
    id: 'tailles', title: 'Huit tailles', kind: 'sizes',
    text: 'De la taille 6 à la taille 13. Pas sûr de la vôtre ? Nous vous envoyons un baguier gratuit avant l’expédition.',
    pose: { rx: Math.PI / 2, ry: 0, rz: 0, dist: 6.4, px: 0, py: 0 },
  },
];

/* ------------------------------------------------------------
   Textures procédurales
   ------------------------------------------------------------ */
function makeBrushedTexture() {
  const size = 1024;
  const c = document.createElement('canvas');
  c.width = size; c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#8c8c8c';
  ctx.fillRect(0, 0, size, size);
  // Stries horizontales (le brossage suit la circonférence de la bague)
  for (let i = 0; i < 9000; i++) {
    const y = Math.random() * size;
    const x = Math.random() * size;
    const len = 40 + Math.random() * 400;
    const v = 40 + Math.random() * 190;
    ctx.strokeStyle = `rgba(${v},${v},${v},${0.25 + Math.random() * 0.5})`;
    ctx.lineWidth = 0.8 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y + (Math.random() - 0.5) * 0.6);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 1);
  tex.anisotropy = 8;
  return tex;
}

function makeEngravingTexture(text) {
  const w = 4096, h = 512;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, w, h);
  // Vu depuis l'intérieur de l'anneau, l'image est inversée : on la retourne.
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = '500 200px "Georgia", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  // petit astérisque « étoile » avant le nom, comme sur la photo
  ctx.fillText('✦ ' + text, w * 0.5, h * 0.52);
  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let brushedTex = null;
let engravingTex = null;

/* ------------------------------------------------------------
   Construction de la bague (géométrie tournée « lathe »)
   ------------------------------------------------------------ */
function buildRing() {
  const Ro = 1.22;   // rayon extérieur (bande brossée)
  const Rb = 1.15;   // rayon en bas du chanfrein
  const Rt = 1.05;   // début de l'arrondi intérieur
  const Ri = 1.0;    // rayon intérieur
  const Hb = 0.19;   // demi-hauteur de la bande brossée
  const Ht = 0.285;  // demi-hauteur totale
  const rr = 0.05;   // rayon de l'arrondi intérieur
  const seg = 160;

  brushedTex = brushedTex || makeBrushedTexture();
  engravingTex = engravingTex || makeEngravingTexture(ENGRAVING);

  const matBand = new THREE.MeshPhysicalMaterial({
    color: '#1b1b1d', metalness: 1, roughness: 0.7,
    roughnessMap: brushedTex, bumpMap: brushedTex, bumpScale: 0.012,
    clearcoat: 0.15, clearcoatRoughness: 0.5, side: THREE.DoubleSide,
  });
  const matPolish = new THREE.MeshPhysicalMaterial({
    color: '#0a0a0c', metalness: 1, roughness: 0.08,
    clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide,
  });
  const matInner = new THREE.MeshPhysicalMaterial({
    color: '#0a0a0c', metalness: 1, roughness: 0.14,
    clearcoat: 0.8, clearcoatRoughness: 0.1, side: THREE.DoubleSide,
  });

  const group = new THREE.Group();
  const lathe = (pts, mat) => {
    const geo = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
    const m = new THREE.Mesh(geo, mat);
    group.add(m);
    return m;
  };
  const arc = (cx, cy, r, a0, a1, n) => {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + (a1 - a0) * (i / n);
      out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return out;
  };

  // Bande centrale brossée
  lathe([[Ro, -Hb], [Ro, Hb]], matBand);
  // Chanfreins polis
  lathe([[Ro, Hb], [Rb, Ht]], matPolish);
  lathe([[Rb, -Ht], [Ro, -Hb]], matPolish);
  // Plats supérieur / inférieur
  lathe([[Rb, Ht], [Rt, Ht]], matPolish);
  lathe([[Rt, -Ht], [Rb, -Ht]], matPolish);
  // Arrondis vers l'intérieur
  lathe(arc(Rt, Ht - rr, rr, Math.PI / 2, Math.PI, 8), matPolish);
  lathe(arc(Rt, -Ht + rr, rr, Math.PI, Math.PI * 1.5, 8), matPolish);
  // Surface intérieure « confort » (légèrement bombée)
  const yi = Ht - rr;
  const inner = [];
  for (let i = 0; i <= 24; i++) {
    const y = yi - (2 * yi) * (i / 24);
    const t = y / yi;
    inner.push([Ri - 0.02 * (1 - t * t), y]);
  }
  lathe(inner, matInner);

  // Gravure : cylindre transparent juste à l'intérieur de la surface
  const engGeo = new THREE.CylinderGeometry(0.976, 0.976, 0.3, 128, 1, true);
  const engMat = new THREE.MeshStandardMaterial({
    map: engravingTex, transparent: true, side: THREE.BackSide,
    metalness: 0.2, roughness: 0.6, depthWrite: false,
  });
  const engraving = new THREE.Mesh(engGeo, engMat);
  group.add(engraving);

  // Ondes NFC (visibles seulement sur la fonctionnalité paiement)
  const nfc = new THREE.Group();
  const waveMat = () => new THREE.MeshBasicMaterial({
    color: '#3ba0ff', transparent: true, opacity: 0, toneMapped: false, side: THREE.DoubleSide,
  });
  const waves = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 128), waveMat());
    m.rotation.x = Math.PI / 2;
    nfc.add(m);
    waves.push(m);
  }
  group.add(nfc);

  const setFinish = (f) => {
    matBand.color.set(f.band);
    matPolish.color.set(f.polish);
    matInner.color.set(f.polish);
    engMat.color.set(f.engraving);
  };
  setFinish(FINISHES[0]);

  return { group, waves, setFinish };
}

/* ------------------------------------------------------------
   Visualiseur : scène, caméra, animation, interaction
   ------------------------------------------------------------ */
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

class RingViewer {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.opts = Object.assign({ idleSpeed: 0.22, parallax: 0.06 }, opts);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    this.camera.position.set(0, 0, 4);

    const key = new THREE.DirectionalLight('#ffffff', 1.6);
    key.position.set(3, 4, 5);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight('#dfe8ff', 0.8);
    rim.position.set(-4, -2, -3);
    this.scene.add(rim);

    // Hiérarchie : turntable (rotation continue) > tilt (parallaxe souris) > pose (orientation) > bague
    this.turntable = new THREE.Group();
    this.tilt = new THREE.Group();
    this.pose = new THREE.Group();
    const ring = buildRing();
    this.ring = ring;
    this.pose.add(ring.group);
    this.tilt.add(this.pose);
    this.turntable.add(this.tilt);
    this.scene.add(this.turntable);

    // État de la pose animée
    this.curQ = new THREE.Quaternion();
    this.fromQ = new THREE.Quaternion();
    this.toQ = new THREE.Quaternion();
    this.curDist = 4; this.fromDist = 4; this.toDist = 4;
    this.curOff = new THREE.Vector2(); this.fromOff = new THREE.Vector2(); this.toOff = new THREE.Vector2();
    this.animT = 1; this.animDur = 1.3;

    // Plateau tournant
    this.spin = 0;
    this.spinVel = 0;
    this.spinTarget = null;
    this.idle = true;

    // Parallaxe souris
    this.mouse = new THREE.Vector2();
    this.mouseSmooth = new THREE.Vector2();

    // NFC
    this.nfcLevel = 0; this.nfcTarget = 0;

    this.clock = new THREE.Clock();
    this.visible = true;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this._bindEvents();
    this.resize();
    if (opts.pose) this.setPose(opts.pose, 0);
    this.renderer.setAnimationLoop(() => this._frame());
  }

  _bindEvents() {
    const c = this.canvas;
    let dragging = false, lastX = 0, lastT = 0;
    c.addEventListener('pointerdown', (e) => {
      dragging = true; lastX = e.clientX; lastT = performance.now();
      this.spinVel = 0; this.spinTarget = null;
      c.classList.add('dragging');
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      const r = c.getBoundingClientRect();
      this.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const now = performance.now();
      const d = dx * 0.008;
      this.spin += d;
      this.spinVel = d / Math.max(1, now - lastT) * 16;
      lastX = e.clientX; lastT = now;
    });
    const end = () => { dragging = false; c.classList.remove('dragging'); };
    c.addEventListener('pointerup', end);
    c.addEventListener('pointercancel', end);
    c.addEventListener('pointerleave', () => { if (!dragging) this.mouse.set(0, 0); });

    const io = new IntersectionObserver((entries) => { this.visible = entries[0].isIntersecting; }, { rootMargin: '100px' });
    io.observe(c);
    new ResizeObserver(() => this.resize()).observe(c);
  }

  resize() {
    const w = this.canvas.clientWidth || 1, h = this.canvas.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    // Sur écran étroit, on recule un peu la caméra pour garder la bague entière
    this.aspectComp = Math.max(1, 0.95 / (w / h));
  }

  setPose(p, dur = 1.3) {
    const e = new THREE.Euler(p.rx || 0, p.ry || 0, p.rz || 0, 'YXZ');
    this.fromQ.copy(this.curQ);
    this.toQ.setFromEuler(e);
    this.fromDist = this.curDist; this.toDist = p.dist || 4;
    this.fromOff.copy(this.curOff); this.toOff.set(p.px || 0, p.py || 0);
    this.animDur = dur;
    this.animT = dur === 0 ? 1 : 0;
    if (dur === 0) { this.curQ.copy(this.toQ); this.curDist = this.toDist; this.curOff.copy(this.toOff); }
  }

  setSpin(target) { // angle absolu (rad) ou null pour rotation libre
    if (target == null) { this.spinTarget = null; this.idle = true; return; }
    this.idle = false;
    // chemin le plus court
    const twoPi = Math.PI * 2;
    let s = this.spin % twoPi; if (s < 0) s += twoPi;
    let t = target % twoPi; if (t < 0) t += twoPi;
    let d = t - s;
    if (d > Math.PI) d -= twoPi; if (d < -Math.PI) d += twoPi;
    this.spinTarget = this.spin + d;
  }

  setFinish(f) { this.ring.setFinish(f); }
  setNFC(on) { this.nfcTarget = on ? 1 : 0; }

  _frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05);
    if (!this.visible) return;
    const t = this.clock.elapsedTime;

    // Pose (orientation / distance / décalage)
    if (this.animT < 1) {
      this.animT = Math.min(1, this.animT + dt / this.animDur);
      const k = easeInOut(this.animT);
      this.curQ.slerpQuaternions(this.fromQ, this.toQ, k);
      this.curDist = THREE.MathUtils.lerp(this.fromDist, this.toDist, k);
      this.curOff.lerpVectors(this.fromOff, this.toOff, k);
    }
    this.pose.quaternion.copy(this.curQ);
    this.camera.position.z = this.curDist * (this.aspectComp || 1);
    this.turntable.position.set(this.curOff.x, this.curOff.y, 0);

    // Plateau tournant
    if (this.spinTarget != null) {
      this.spin += (this.spinTarget - this.spin) * Math.min(1, dt * 4);
    } else {
      if (Math.abs(this.spinVel) > 0.0005) {
        this.spin += this.spinVel; this.spinVel *= 0.94;
      } else if (this.idle && !this.reduced) {
        this.spin += this.opts.idleSpeed * dt;
      }
    }
    this.turntable.rotation.y = this.spin;

    // Flottement + parallaxe
    if (!this.reduced) this.turntable.position.y += Math.sin(t * 0.9) * 0.02;
    this.mouseSmooth.lerp(this.mouse, Math.min(1, dt * 5));
    this.tilt.rotation.x = -this.mouseSmooth.y * this.opts.parallax * 2;
    this.tilt.rotation.y = this.mouseSmooth.x * this.opts.parallax * 2;

    // Ondes NFC
    this.nfcLevel += (this.nfcTarget - this.nfcLevel) * Math.min(1, dt * 3);
    if (this.nfcLevel > 0.001) {
      this.ring.waves.forEach((w, i) => {
        const ph = ((t * 0.55 + i / 3) % 1);
        const s = 0.35 + ph * 0.6;
        w.scale.setScalar(s);
        w.material.opacity = this.nfcLevel * (1 - ph) * 0.9;
        w.visible = true;
      });
    } else {
      this.ring.waves.forEach((w) => { w.visible = false; });
    }

    this.renderer.render(this.scene, this.camera);
  }
}

/* ------------------------------------------------------------
   Explorateur de fonctionnalités (liste à gauche, bague à droite)
   ------------------------------------------------------------ */
function buildExplorer(viewer) {
  const list = document.getElementById('features');
  let active = -1;
  let finish = FINISHES[0];
  let size = '9';

  const items = FEATURES.map((f, i) => {
    const li = document.createElement('li');
    li.className = 'feature';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'feature__btn';
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = f.kind === 'colors'
      ? `<span class="feature__swatch" style="background:${finish.swatch}"></span><span>${f.title}</span>`
      : `<span class="feature__plus" aria-hidden="true"></span><span>${f.title}</span>`;
    btn.addEventListener('click', () => select(i));

    const card = document.createElement('div');
    card.className = 'feature__card';
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', f.title);
    renderCard(card, f);

    li.append(btn, card);
    list.appendChild(li);
    return { li, btn, card };
  });

  function renderCard(card, f) {
    if (f.kind === 'colors') {
      card.innerHTML = `<p><b>${f.title}.</b> ${f.text} <span class="finish-name">${finish.label}</span>.</p>
        <div class="swatches" role="group" aria-label="Choisir une finition"></div>`;
      const sw = card.querySelector('.swatches');
      FINISHES.forEach((fin) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'swatch';
        b.style.background = `radial-gradient(circle at 35% 30%, #fff5, transparent 45%), ${fin.swatch}`;
        b.setAttribute('aria-label', fin.label);
        b.setAttribute('aria-pressed', String(fin.id === finish.id));
        b.addEventListener('click', () => {
          finish = fin;
          viewer.setFinish(fin);
          heroViewer && heroViewer.setFinish(fin);
          sw.querySelectorAll('.swatch').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          card.querySelector('.finish-name').textContent = fin.label;
          items[0].btn.querySelector('.feature__swatch').style.background = fin.swatch;
        });
        sw.appendChild(b);
      });
    } else if (f.kind === 'sizes') {
      card.innerHTML = `<p><b>${f.title}.</b> ${f.text}</p><div class="sizes" role="group" aria-label="Choisir une taille"></div>`;
      const wrap = card.querySelector('.sizes');
      SIZES.forEach((s) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'size'; b.textContent = s;
        b.setAttribute('aria-pressed', String(s === size));
        b.addEventListener('click', () => {
          size = s;
          wrap.querySelectorAll('.size').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        });
        wrap.appendChild(b);
      });
    } else {
      card.innerHTML = `<p><b>${f.title}.</b> ${f.text}</p>`;
    }
  }

  const prev = document.getElementById('feat-prev');
  const next = document.getElementById('feat-next');

  function select(i) {
    if (i === active) return;
    active = i;
    items.forEach((it, j) => {
      it.li.classList.toggle('is-active', j === i);
      it.btn.setAttribute('aria-expanded', String(j === i));
    });
    const f = FEATURES[i];
    viewer.setPose(f.pose);
    viewer.setSpin(f.spin != null ? f.spin : null);
    viewer.setNFC(!!f.nfc);
    prev.disabled = i <= 0;
    next.disabled = i >= FEATURES.length - 1;
  }

  prev.addEventListener('click', () => select(Math.max(0, active - 1)));
  next.addEventListener('click', () => select(Math.min(FEATURES.length - 1, active + 1)));

  // Navigation clavier sur la liste
  list.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); select(Math.min(FEATURES.length - 1, active + 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); select(Math.max(0, active - 1)); }
  });

  select(0);
}

/* ------------------------------------------------------------
   Démarrage
   ------------------------------------------------------------ */
let heroViewer = null;

function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

document.getElementById('year').textContent = String(new Date().getFullYear());

// Apparition au scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

if (supportsWebGL()) {
  heroViewer = new RingViewer(document.getElementById('hero-canvas'), {
    idleSpeed: 0.35, parallax: 0.08,
    pose: { rx: 1.0, ry: 0.5, rz: 0.15, dist: 5.6 },
  });
  const explorerViewer = new RingViewer(document.getElementById('explorer-canvas'), {
    idleSpeed: 0.18, parallax: 0.05,
    pose: FEATURES[0].pose,
  });
  buildExplorer(explorerViewer);
} else {
  document.querySelectorAll('.ring-canvas').forEach((c) => {
    const p = document.createElement('p');
    p.textContent = 'Votre navigateur ne prend pas en charge la 3D.';
    p.style.cssText = 'text-align:center;color:#86868b;padding:80px 0';
    c.replaceWith(p);
  });
  document.getElementById('features').innerHTML = FEATURES.map((f) => `<li class="feature is-active"><div class="feature__card"><p><b>${f.title}.</b> ${f.text}</p></div></li>`).join('');
}
