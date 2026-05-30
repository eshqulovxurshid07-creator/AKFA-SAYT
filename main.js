/* ============================================================
   AKFA ROM — main.js
   GSAP animations, scroll effects, calculator, interactions
   ============================================================ */

/* ──────────────────────────────────────────
   Utility: wait for DOM
─────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', init);

function init(){
  initNav();
  initScrollTop();
  initFAQ();
  initGalleryFilter();
  initCalculator();
  initContactForm();
  initCounters();
  initParticles();
  initMobileNav();

  /* GSAP animations if library is available */
  if(typeof gsap !== 'undefined'){
    initGSAP();
  } else {
    initFallbackAnims();
  }
}

/* ──────────────────────────────────────────
   NAV — scroll state + active link
─────────────────────────────────────────── */
function initNav(){
  const nav = document.querySelector('.nav');
  if(!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    const scrollTop = document.querySelector('.scroll-top');
    if(scrollTop) scrollTop.classList.toggle('vis', window.scrollY > 400);
  };
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* Active nav link */
  const links = document.querySelectorAll('.nav-link[href]');
  const current = location.pathname.split('/').pop() || 'index.html';
  links.forEach(l => {
    const href = l.getAttribute('href').split('/').pop();
    if(href === current) l.classList.add('active');
  });
}

/* ──────────────────────────────────────────
   MOBILE NAV
─────────────────────────────────────────── */
function initMobileNav(){
  const toggle = document.querySelector('.nav-toggle');
  const mobileNav = document.querySelector('.nav-mobile');
  if(!toggle || !mobileNav) return;

  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    const spans = toggle.querySelectorAll('span');
    if(open){
      spans[0].style.transform='rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity='0';
      spans[2].style.transform='rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s=>{s.style.transform='';s.style.opacity='';});
    }
  });

  document.querySelectorAll('.nav-mobile-link').forEach(l => {
    l.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.querySelectorAll('span').forEach(s=>{s.style.transform='';s.style.opacity='';});
    });
  });
}

/* ──────────────────────────────────────────
   SCROLL TOP
─────────────────────────────────────────── */
function initScrollTop(){
  const btn = document.querySelector('.scroll-top');
  if(btn) btn.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));
}

/* ──────────────────────────────────────────
   FAQ ACCORDION
─────────────────────────────────────────── */
function initFAQ(){
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const q = item.querySelector('.faq-q');
    if(!q) return;
    q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });

  /* FAQ search */
  const search = document.querySelector('.faq-search-input');
  if(search){
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase().trim();
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    });
  }

  /* FAQ category filter */
  document.querySelectorAll('.faq-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-cat-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      items.forEach(item => {
        item.style.display = (!cat || cat==='all' || item.dataset.cat===cat) ? '' : 'none';
      });
    });
  });
}

/* ──────────────────────────────────────────
   GALLERY FILTER
─────────────────────────────────────────── */
function initGalleryFilter(){
  const btns = document.querySelectorAll('.fil-btn');
  const items = document.querySelectorAll('.gal-item');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      items.forEach(item => {
        const show = !cat || cat==='all' || item.dataset.cat===cat;
        item.style.opacity = show ? '1' : '0';
        item.style.transform = show ? '' : 'scale(.95)';
        item.style.pointerEvents = show ? '' : 'none';
        setTimeout(()=>{ item.style.display = show ? '' : 'none'; }, show?0:300);
        if(show) requestAnimationFrame(()=>requestAnimationFrame(()=>{
          item.style.opacity='1'; item.style.transform='';
        }));
      });
    });
  });
}

/* ──────────────────────────────────────────
   PRICE CALCULATOR
─────────────────────────────────────────── */
const PRICES = {
  base_per_sqm: 1_200_000,      /* UZS per m² base */
  types: [1.0, 1.35, 1.6, 1.9, 2.2],
  floor_mult: [1.0, 1.0, 1.05, 1.08, 1.12, 1.15],
};

function initCalculator(){
  const btn = document.querySelector('#calc-btn');
  if(!btn) return;

  btn.addEventListener('click', calculatePrice);

  /* live preview */
  ['calc-width','calc-height','calc-type','calc-color','calc-floors'].forEach(id=>{
    const el = document.getElementById(id);
    if(el) el.addEventListener('input', ()=>{
      const res = document.querySelector('.calc-result');
      if(res && res.classList.contains('show')) calculatePrice();
    });
  });
}

function calculatePrice(){
  const w = parseFloat(document.getElementById('calc-width')?.value) || 120;
  const h = parseFloat(document.getElementById('calc-height')?.value) || 140;
  const typeIdx = parseInt(document.getElementById('calc-type')?.value) || 0;
  const floorVal = parseInt(document.getElementById('calc-floors')?.value) || 1;

  const area = (w/100) * (h/100);
  const floorMult = PRICES.floor_mult[Math.min(floorVal, PRICES.floor_mult.length-1)];
  const typeMult = PRICES.types[typeIdx];
  const price = Math.round(area * PRICES.base_per_sqm * typeMult * floorMult);
  const days = typeIdx >= 3 ? '14–21' : typeIdx >= 1 ? '10–14' : '7–10';

  const res = document.querySelector('.calc-result');
  if(!res) return;
  res.classList.add('show');

  const areaEl = document.getElementById('res-area');
  const priceEl = document.getElementById('res-price');
  const timeEl = document.getElementById('res-time');

  if(areaEl) animateNum(areaEl, 0, Math.round(area*100)/100, ' m²');
  if(priceEl) animateNum(priceEl, 0, price, ' UZS', true);
  if(timeEl) { timeEl.textContent = days + (activeLang==='uz'?' kun': activeLang==='ru'?' дней':' days'); }

  /* Scroll to result */
  res.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function animateNum(el, from, to, suffix='', format=false){
  const dur = 800;
  const start = performance.now();
  const update = now => {
    const p = Math.min((now-start)/dur, 1);
    const ease = p < .5 ? 2*p*p : -1+(4-2*p)*p;
    const val = from + (to-from)*ease;
    el.textContent = (format ? Math.round(val).toLocaleString('uz-UZ') : Math.round(val*100)/100) + suffix;
    if(p < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

/* ──────────────────────────────────────────
   CONTACT FORM
─────────────────────────────────────────── */
function initContactForm(){
  const form = document.getElementById('contact-form');
  if(!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    const origText = btn.textContent;
    btn.disabled = true;
    btn.textContent = t('ct_sending');

    /* Simulate send (replace with real endpoint) */
    await new Promise(r => setTimeout(r, 1600));

    const success = document.getElementById('form-success');
    if(success){
      form.style.display='none';
      success.style.display='block';
    } else {
      btn.textContent = t('ct_success');
      setTimeout(()=>{ btn.disabled=false; btn.textContent=origText; form.reset(); }, 3000);
    }
  });
}

/* ──────────────────────────────────────────
   COUNTERS (Intersection Observer)
─────────────────────────────────────────── */
function initCounters(){
  const counters = document.querySelectorAll('[data-count]');
  if(!counters.length) return;

  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        animateNum(el, 0, target, suffix);
        obs.unobserve(el);
      }
    });
  }, {threshold:.5});

  counters.forEach(c => obs.observe(c));
}

/* ──────────────────────────────────────────
   PARTICLES (hero section)
─────────────────────────────────────────── */
function initParticles(){
  const container = document.querySelector('.win-particles');
  if(!container) return;

  const N = 14;
  for(let i=0; i<N; i++){
    const p = document.createElement('div');
    p.className='particle';
    p.style.cssText=`
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      --d:${4+Math.random()*6}s;
      --dl:${-Math.random()*4}s;
      width:${1+Math.random()*2.5}px;
      height:${1+Math.random()*2.5}px;
      opacity:${.2+Math.random()*.5}`;
    container.appendChild(p);
  }
}

/* ──────────────────────────────────────────
   GSAP Animations
─────────────────────────────────────────── */
function initGSAP(){
  gsap.registerPlugin(ScrollTrigger);

  /* Hero */
  const heroTl = gsap.timeline({defaults:{ease:'power3.out', duration:.9}});
  heroTl
    .from('.hero-eyebrow', {y:20, opacity:0})
    .from('.hero-title',   {y:30, opacity:0}, '-=.5')
    .from('.hero-desc',    {y:20, opacity:0}, '-=.5')
    .from('.hero-btns',    {y:20, opacity:0}, '-=.4')
    .from('.hero-stats .stat-val, .hero-stats .stat-lbl', {y:15, opacity:0, stagger:.1}, '-=.4')
    .from('.win-wrap',     {x:60, opacity:0, scale:.93}, '-=.9');

  /* Section fade-in */
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    gsap.from(el, {
      y: 40, opacity:0, duration:.8, ease:'power3.out',
      scrollTrigger:{ trigger:el, start:'top 86%', toggleActions:'play none none none' }
    });
  });

  /* Stagger cards */
  gsap.utils.toArray('[data-reveal-stagger]').forEach(parent => {
    const children = parent.children;
    gsap.from(children, {
      y:40, opacity:0, duration:.7, ease:'power3.out', stagger:.1,
      scrollTrigger:{ trigger:parent, start:'top 82%' }
    });
  });

  /* Horizontal scroll hint */
  const winWrap = document.querySelector('.win-wrap');
  if(winWrap){
    gsap.to(winWrap, {
      rotateY:8, rotateX:-3,
      scrollTrigger:{ trigger:'.hero', scrub:1.2 }
    });
  }

  /* Parallax sections */
  gsap.utils.toArray('.parallax-bg').forEach(el => {
    gsap.to(el, {
      y:'20%', ease:'none',
      scrollTrigger:{ trigger:el.parentElement, scrub:true }
    });
  });
}

/* Fallback if GSAP not loaded */
function initFallbackAnims(){
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.style.opacity='1';
        e.target.style.transform='translateY(0)';
        obs.unobserve(e.target);
      }
    });
  },{threshold:.15});

  document.querySelectorAll('[data-reveal],[data-reveal-stagger]>*').forEach(el=>{
    el.style.opacity='0';
    el.style.transform='translateY(30px)';
    el.style.transition='opacity .7s ease, transform .7s ease';
    obs.observe(el);
  });
}

/* ──────────────────────────────────────────
   WINDOW SVG — inline animated SVGs
─────────────────────────────────────────── */
const WIN_SVG = {
  /* Large hero window */
  large: `<svg viewBox="0 0 260 320" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">
    <defs>
      <linearGradient id="frameG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#c9a84c" stop-opacity=".9"/>
        <stop offset="100%" stop-color="#9a7c30" stop-opacity=".7"/>
      </linearGradient>
      <linearGradient id="glassG" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#a8d8ff" stop-opacity=".12"/>
        <stop offset="50%" stop-color="#ddf4ff" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#6ec6ff" stop-opacity=".08"/>
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <!-- Outer frame -->
    <rect x="10" y="10" width="240" height="300" rx="4" fill="none" stroke="url(#frameG)" stroke-width="8" filter="url(#glow)"/>
    <!-- Inner frame -->
    <rect x="20" y="20" width="220" height="280" rx="2" fill="url(#glassG)" stroke="url(#frameG)" stroke-width="3" stroke-opacity=".6"/>
    <!-- Center divider H -->
    <line x1="20" y1="160" x2="240" y2="160" stroke="url(#frameG)" stroke-width="5"/>
    <!-- Center divider V -->
    <line x1="130" y1="20" x2="130" y2="300" stroke="url(#frameG)" stroke-width="5"/>
    <!-- Glass panes subtle shine -->
    <path d="M30 30 Q60 45 120 35 L120 150 Q80 155 30 145 Z" fill="white" opacity=".04"/>
    <path d="M140 30 Q190 38 230 30 L230 150 Q195 158 140 150 Z" fill="white" opacity=".04"/>
    <!-- Handle -->
    <rect x="118" y="148" width="24" height="6" rx="3" fill="url(#frameG)" opacity=".9"/>
    <rect x="127" y="142" width="6" height="18" rx="3" fill="url(#frameG)" opacity=".9"/>
    <!-- Hinges -->
    <rect x="14" y="40" width="10" height="16" rx="2" fill="#c9a84c" opacity=".7"/>
    <rect x="14" y="244" width="10" height="16" rx="2" fill="#c9a84c" opacity=".7"/>
    <!-- Reflection line top pane left -->
    <line x1="35" y1="35" x2="65" y2="65" stroke="white" stroke-width="1.5" opacity=".15"/>
    <!-- Reflection line top pane right -->
    <line x1="148" y1="35" x2="178" y2="65" stroke="white" stroke-width="1.5" opacity=".15"/>
  </svg>`,

  /* Small thumbnail -->
  small: `<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" style="width:80px;height:90px;opacity:.6">
    <rect x="4" y="4" width="112" height="132" rx="3" fill="none" stroke="#c9a84c" stroke-width="5" opacity=".7"/>
    <rect x="10" y="10" width="100" height="120" rx="2" fill="rgba(168,216,255,.07)" stroke="#c9a84c" stroke-width="2" opacity=".5"/>
    <line x1="60" y1="10" x2="60" y2="130" stroke="#c9a84c" stroke-width="3" opacity=".6"/>
    <line x1="10" y1="70" x2="110" y2="70" stroke="#c9a84c" stroke-width="3" opacity=".6"/>
    <rect x="54" y="67" width="12" height="4" rx="2" fill="#c9a84c" opacity=".8"/>
  </svg>`,

  /* Product card showcase */
  product: (name, color='#c9a84c') => `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:180px">
    <defs>
      <linearGradient id="pg${name}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity=".8"/>
        <stop offset="100%" stop-color="${color}" stop-opacity=".4"/>
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="184" height="184" rx="4" fill="none" stroke="url(#pg${name})" stroke-width="7"/>
    <rect x="16" y="16" width="168" height="168" rx="2" fill="rgba(168,216,255,.06)" stroke="${color}" stroke-width="2.5" opacity=".5"/>
    <line x1="100" y1="16" x2="100" y2="184" stroke="${color}" stroke-width="4" opacity=".55"/>
    <line x1="16" y1="100" x2="184" y2="100" stroke="${color}" stroke-width="4" opacity=".55"/>
    <rect x="88" y="96" width="24" height="8" rx="4" fill="${color}" opacity=".85"/>
    <rect x="96" y="88" width="8" height="24" rx="4" fill="${color}" opacity=".85"/>
    <path d="M22 22 Q40 28 95 24 L95 95 Q60 98 22 94 Z" fill="white" opacity=".03"/>
  </svg>`
};

/* Inject SVGs wherever placeholder class exists */
function injectSVGs(){
  document.querySelectorAll('.win-svg-large').forEach(el => el.innerHTML = WIN_SVG.large);
  document.querySelectorAll('.win-svg-small').forEach(el => el.innerHTML = WIN_SVG.small);
  document.querySelectorAll('.win-svg-prod').forEach(el => {
    const name = el.dataset.name || 'w';
    const color = el.dataset.color || '#c9a84c';
    el.innerHTML = WIN_SVG.product(name, color);
  });
}

document.addEventListener('DOMContentLoaded', injectSVGs);

/* ──────────────────────────────────────────
   LIGHTBOX (gallery)
─────────────────────────────────────────── */
function initLightbox(){
  const overlay = document.createElement('div');
  overlay.id='lb-overlay';
  overlay.style.cssText=`position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;
    display:none;align-items:center;justify-content:center;cursor:zoom-out;
    backdrop-filter:blur(8px)`;
  overlay.innerHTML=`<div id="lb-img" style="max-width:90vw;max-height:85vh;text-align:center"></div>
    <button id="lb-close" style="position:absolute;top:1.5rem;right:1.5rem;color:#c9a84c;
      font-size:1.75rem;background:none;border:none;cursor:pointer;line-height:1">✕</button>`;
  document.body.appendChild(overlay);

  document.querySelectorAll('.gal-item').forEach(item => {
    item.addEventListener('click', () => {
      const svg = item.querySelector('svg');
      const img = item.querySelector('img');
      const content = svg ? svg.outerHTML : img ? `<img src="${img.src}" style="max-width:90vw;max-height:85vh;border-radius:8px">` : '';
      document.getElementById('lb-img').innerHTML = content;
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  const close = () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
  };
  overlay.addEventListener('click', e => { if(e.target===overlay) close(); });
  document.getElementById('lb-close')?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if(e.key==='Escape') close(); });
}

document.addEventListener('DOMContentLoaded', ()=> {
  if(document.querySelector('.gal-item')) initLightbox();
});
