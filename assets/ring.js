/* Curio — the ring, once. Procedural model shared by every page (needs THREE loaded first).
   Profile in millimetres; `unit` scales it into scene units (0.1 → 1 unit = 1 cm, 1 → 1 unit = 1 mm). */
window.CurioRing = (function(){
  var PROFILE = { RI:8.75, RO:10.75, RL:10.35, ZB:2.55, ZL:3.65, H:4.0 };   // inner radius, outer, bevel start, half-band, bevel end, half-height
  var FINISHES = [
    { id:'black',    label:'black ceramic',    band:0x1b1b1d, polish:0x0c0c0e, engraving:0x8a8a92, swatch:'#141416' },
    { id:'titanium', label:'brushed titanium', band:0x8f9298, polish:0xc9ccd1, engraving:0x2a2a2e, swatch:'#b9bcc2' },
    { id:'rose',     label:'rose gold',        band:0xc9977f, polish:0xe6bda8, engraving:0x4a2e24, swatch:'#dcae98' },
    { id:'night',    label:'midnight blue',    band:0x1e2b4d, polish:0x0f1730, engraving:0xb9c4e6, swatch:'#1b2745' }
  ];

  /* Studio environment (procedural equirectangular: dark room, a few softboxes) */
  function studioEnv(renderer){
    var c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    var x = c.getContext('2d');
    var g = x.createLinearGradient(0,0,0,512);
    g.addColorStop(0,'#1c1d22'); g.addColorStop(.55,'#0a0a0c'); g.addColorStop(1,'#020203');
    x.fillStyle = g; x.fillRect(0,0,1024,512);
    function softbox(cx, cy, w, h, bright, rot){
      x.save(); x.translate(cx, cy); x.rotate(rot||0);
      var gg = x.createRadialGradient(0,0,2, 0,0, Math.max(w,h));
      gg.addColorStop(0, 'rgba(255,255,255,'+bright+')');
      gg.addColorStop(.6, 'rgba(240,242,248,'+bright*0.35+')');
      gg.addColorStop(1, 'rgba(240,242,248,0)');
      x.fillStyle = gg;
      x.scale(w/Math.max(w,h), h/Math.max(w,h));
      x.beginPath(); x.arc(0,0,Math.max(w,h),0,Math.PI*2); x.fill();
      x.restore();
    }
    softbox(260, 120, 300, 70, .95, -0.08);   // main top softbox
    softbox(790, 150, 220, 55, .75, 0.1);     // second softbox
    softbox(520, 330, 420, 40, .28, 0);       // low strip, fill
    softbox(60, 240, 60, 160, .35, 0);        // side kick
    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var env = pmrem.fromEquirectangular(tex).texture;
    tex.dispose(); pmrem.dispose();
    return env;
  }

  /* Light-theme studio lights */
  function lights(scene){
    var key = new THREE.DirectionalLight(0xffffff, .7);
    key.position.set(2.5, 3, 2);
    scene.add(key);
    var fill = new THREE.DirectionalLight(0xe8ecf5, .45);
    fill.position.set(-3, -1, 3);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xffffff, .9));
  }

  function brushedRoughness(){
    var c = document.createElement('canvas');
    c.width = 512; c.height = 128;
    var x = c.getContext('2d');
    x.fillStyle = '#b4b4b4'; x.fillRect(0,0,512,128);  // base roughness ~0.7
    for (var i=0;i<900;i++){
      var y = Math.random()*128;
      var v = 150 + Math.random()*90|0;
      x.strokeStyle = 'rgba('+v+','+v+','+v+',0.5)';
      x.lineWidth = Math.random()*1.2;
      x.beginPath(); x.moveTo(0, y); x.lineTo(512, y + (Math.random()-0.5)*2); x.stroke();
    }
    var t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.repeat.set(3,1);
    return t;
  }
  function engravingMap(text){
    // White text on a transparent background: the colour comes from the material (per finish)
    var c = document.createElement('canvas');
    c.width = 2048; c.height = 256;
    var x = c.getContext('2d');
    x.clearRect(0,0,2048,256);
    x.fillStyle = '#ffffff';
    x.font = '500 118px "Cormorant Garamond", serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.save(); x.translate(1024,132); x.scale(-1,1);   // mirrored: readable from the inside
    x.fillText(text, 0, 0);
    x.restore();
    var t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.encoding = THREE.sRGBEncoding;
    return t;
  }

  /* build(renderer, { unit, innerMm, engraving, waves, segments })
     → { ring, waves, materials, applyFinish(f), setInner(mm), innerRadius, outerRadius } */
  function build(renderer, o){
    o = o || {};
    var S = o.unit != null ? o.unit : 0.1;
    var segs = o.segments || 220;
    var P = PROFILE;
    var matBrushed = new THREE.MeshStandardMaterial({ color:0x1b1b1d, metalness:1, roughness:.72, roughnessMap:brushedRoughness(), envMapIntensity:1.0 });
    var matPolished = new THREE.MeshStandardMaterial({ color:0x0c0c0e, metalness:1, roughness:.09, envMapIntensity:1.35 });
    var matInner = new THREE.MeshStandardMaterial({ color:0x0c0c0e, metalness:1, roughness:.16, side:THREE.BackSide, envMapIntensity:1.1 });
    var matEngraving = o.engraving ? new THREE.MeshStandardMaterial({
      color:0x8a8a92, map:engravingMap(o.engraving), transparent:true, depthWrite:false,
      metalness:.4, roughness:.5, side:THREE.BackSide, envMapIntensity:.8
    }) : null;

    var ring = new THREE.Group();
    ring.rotation.order = 'YXZ';          // generated around Y; pages stand it up with rotation.x
    var body = new THREE.Group();
    ring.add(body);
    var RI = P.RI, RO = P.RO, RL = P.RL;

    function lathe(points, mat){
      var pts = points.map(function(p){ return new THREE.Vector2(p[0]*S, p[1]*S); });
      return new THREE.Mesh(new THREE.LatheGeometry(pts, segs), mat);
    }
    function setInner(mm){
      while (body.children.length){ var m = body.children.pop(); m.geometry.dispose(); }
      RI = mm/2; RO = RI + (P.RO - P.RI); RL = RI + (P.RL - P.RI);   // band thickness fixed, radius follows the size
      body.add(lathe([[RO,-P.ZB],[RO,P.ZB]], matBrushed));                          // central band
      body.add(lathe([[RI,-P.H],[RL,-P.H],[RL,-P.ZL],[RO,-P.ZB]], matPolished));    // bevel + one edge
      body.add(lathe([[RO,P.ZB],[RL,P.ZL],[RL,P.H],[RI,P.H]], matPolished));        // bevel + other edge
      body.add(lathe([[RI,-P.H],[RI,P.H]], matInner));                              // polished inside
      if (matEngraving){
        var r = RI*S*0.995;
        body.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r, P.H*S*1.5, segs, 1, true), matEngraving));
      }
    }
    setInner(o.innerMm || P.RI*2);

    // NFC waves (hidden until a page shows them)
    var waves = [];
    if (o.waves){
      for (var w=0; w<3; w++){
        var wm = new THREE.Mesh(
          new THREE.TorusGeometry(1, 0.009, 8, 160),
          new THREE.MeshBasicMaterial({ color:0x2f6fd6, transparent:true, opacity:0, toneMapped:false, side:THREE.DoubleSide }));
        wm.rotation.x = Math.PI/2;
        wm.visible = false;
        ring.add(wm); waves.push(wm);
      }
    }

    function applyFinish(f){
      matBrushed.color.setHex(f.band);
      matPolished.color.setHex(f.polish);
      matInner.color.setHex(f.polish);
      if (matEngraving) matEngraving.color.setHex(f.engraving);
    }

    return {
      ring: ring, waves: waves,
      materials: { brushed:matBrushed, polished:matPolished, inner:matInner, engraving:matEngraving },
      applyFinish: applyFinish,
      setInner: setInner,
      get innerRadius(){ return RI*S; },
      get outerRadius(){ return RO*S; }
    };
  }

  return { PROFILE:PROFILE, FINISHES:FINISHES, studioEnv:studioEnv, lights:lights, build:build };
})();
