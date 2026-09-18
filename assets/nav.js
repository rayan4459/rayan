/* Curio — shared behaviour: menu bar, footer year, reveal, remembered size.
   Also the one place where the size table lives (US / mm / EU / UK). */
window.CurioSizes = [
  { us:'6',  mm:16.5, eu:52, uk:'L½' },
  { us:'7',  mm:17.3, eu:54, uk:'N½' },
  { us:'8',  mm:18.1, eu:57, uk:'P½' },
  { us:'9',  mm:18.9, eu:59, uk:'R½' },
  { us:'10', mm:19.8, eu:62, uk:'T½' },
  { us:'11', mm:20.6, eu:65, uk:'V½' },
  { us:'12', mm:21.4, eu:67, uk:'X½' },
  { us:'13', mm:22.2, eu:70, uk:'Z½' }
];
window.CurioSizes.label = function(s){ return 'US ' + s.us + ' · EU ' + s.eu + ' · UK ' + s.uk; };
window.CurioSizes.byUs = function(us){
  for (var i = 0; i < window.CurioSizes.length; i++) if (window.CurioSizes[i].us === String(us)) return i;
  return -1;
};

/* What the visitor has already told us (sizer result, chosen finish) — one localStorage key */
window.CurioMemory = {
  read: function(){ try { return JSON.parse(localStorage.getItem('curio-sizer') || 'null') || {}; } catch(e){ return {}; } },
  write: function(patch){
    try {
      var cur = window.CurioMemory.read();
      Object.keys(patch).forEach(function(k){ cur[k] = patch[k]; });
      localStorage.setItem('curio-sizer', JSON.stringify(cur));
    } catch(e){}
  }
};

/* Theme: light by default, dark on request (header buttons). The <head> of each page applies the
   remembered choice before paint; this keeps the buttons in sync and tells the 3D scenes. */
window.CurioTheme = (function(){
  var BG = { light:'#ffffff', dark:'#050506' };   // must match --bg in site.css
  var busy = false, wipe = null, crest = null;
  function apply(t){
    if (t === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('curio-theme', t); } catch(e){}
    Array.prototype.forEach.call(document.querySelectorAll('[data-theme-set]'), function(b){
      b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-set') === t));
    });
    window.dispatchEvent(new CustomEvent('curio-theme', { detail:t }));
  }
  function layers(){
    if (wipe) return;
    wipe = document.createElement('div'); wipe.className = 'themeWipe'; wipe.setAttribute('aria-hidden', 'true');
    crest = document.createElement('div'); crest.className = 'themeCrest'; crest.setAttribute('aria-hidden', 'true');
    document.body.appendChild(wipe); document.body.appendChild(crest);
  }
  return {
    get: function(){ return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; },
    /* set(t): switch with the diagonal curtain (top-left → bottom-right); set(t, true): instantly */
    set: function(t, instant){
      if (t === this.get()) return;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (instant || reduce || busy){ if (!busy) apply(t); return; }
      busy = true;
      layers();
      wipe.style.background = BG[t] || BG.light;
      wipe.className = 'themeWipe is-in'; crest.className = 'themeCrest is-in';
      var done = false;
      function covered(){
        if (done) return; done = true;
        apply(t);                                   // the page repaints under the curtain
        wipe.className = 'themeWipe is-out'; crest.className = 'themeCrest is-out';
        var done2 = false;
        function gone(){ if (done2) return; done2 = true; wipe.className = 'themeWipe'; crest.className = 'themeCrest'; busy = false; }
        wipe.addEventListener('animationend', gone, { once:true });
        setTimeout(gone, 700);                      // safety net
      }
      wipe.addEventListener('animationend', covered, { once:true });
      setTimeout(covered, 700);
    }
  };
})();

(function(){
  Array.prototype.forEach.call(document.querySelectorAll('[data-theme-set]'), function(b){
    b.setAttribute('aria-pressed', String(b.getAttribute('data-theme-set') === window.CurioTheme.get()));
    b.addEventListener('click', function(){ window.CurioTheme.set(b.getAttribute('data-theme-set')); });
  });

  var nav = document.getElementById('nav'), burger = document.getElementById('burger');
  if (nav && burger){
    burger.addEventListener('click', function(){
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });
  }
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());

  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if (en.isIntersecting) en.target.classList.add('inview'); });
    }, { threshold:0.15 });
    Array.prototype.forEach.call(reveals, function(el){ io.observe(el); });
  } else {
    Array.prototype.forEach.call(reveals, function(el){ el.classList.add('inview'); });
  }

  // "Your size · US 9" in the menu once the sizer has been completed
  var badge = document.querySelector('.nav__size');
  var mem = window.CurioMemory.read();
  if (badge && mem.done && mem.sizeIndex >= 0 && mem.sizeIndex < window.CurioSizes.length){
    badge.textContent = 'Your size · US ' + window.CurioSizes[mem.sizeIndex].us;
    badge.hidden = false;
  }
})();
