document.getElementById('workflowBtn').addEventListener('click', ()=> {
  document.getElementById('about').scrollIntoView({behavior:'smooth'});
});
document.querySelector('.nav-toggle')?.addEventListener('click', ()=>{
  const nav = document.querySelector('.nav-links');
  nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
});


// Si usas AOS (https://michalsnik.github.io/aos/), inicializa:
if (window.AOS) AOS.init({duration:700, once:true, offset:80});

// Fallback simple: animar tarjetas al entrar en viewport (sin librería)
const tarjetas = document.querySelectorAll('.tarjeta-servicio');
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add('in-view');
  });
},{threshold:0.12});
tarjetas.forEach(t=>observer.observe(t));

// Filtro por categoría
document.querySelectorAll('.filtro-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.filtro-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.getAttribute('data-filter');
    document.querySelectorAll('.grupo').forEach(g=>{
      if(filter === 'all') g.style.display = '';
      else g.style.display = g.getAttribute('data-category') === filter ? '' : 'none';
    });
  });
});

// Búsqueda y filtro para la sección de precios
(function(){
  const input = document.getElementById('buscar-precio');
  const filtroBtns = document.querySelectorAll('.filtro-btn');
  const tarjetas = Array.from(document.querySelectorAll('#precios-grid .tarjeta-servicio'));

  // Filtrar por categoría
  filtroBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filtroBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      tarjetas.forEach(t=>{
        const cat = t.getAttribute('data-category') || 'otros';
        t.style.display = (filter === 'all' || filter === cat) ? '' : 'none';
      });
      // limpiar búsqueda al cambiar filtro
      input.value = '';
    });
  });

  // Búsqueda por nombre (filtra tarjetas visibles por filtro también)
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    const activeFilter = document.querySelector('.filtro-btn.active')?.getAttribute('data-filter') || 'all';
    tarjetas.forEach(t=>{
      const name = (t.getAttribute('data-name') || t.querySelector('.servicio-info h3')?.textContent || '').toLowerCase();
      const matchesSearch = name.includes(q);
      const matchesFilter = (activeFilter === 'all') || (t.getAttribute('data-category') === activeFilter);
      t.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
    });
  });

  // Mejora: permitir Enter para limpiar búsqueda
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') input.value = '', input.dispatchEvent(new Event('input'));
  });
})();

// Mobile menu toggle and accessibility
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');

function openMobileMenu(){
  mobileMenu.style.display = 'block';
  mobileMenu.setAttribute('aria-hidden','false');
  navToggle.setAttribute('aria-expanded','true');
  // trap focus to first focusable element
  const first = mobileMenu.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
  first?.focus();
}
function closeMobileMenu(){
  mobileMenu.style.display = 'none';
  mobileMenu.setAttribute('aria-hidden','true');
  navToggle.setAttribute('aria-expanded','false');
  navToggle.focus();
}

navToggle?.addEventListener('click', ()=>{
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  if(open) closeMobileMenu(); else openMobileMenu();
});
mobileClose?.addEventListener('click', closeMobileMenu);

// Close mobile menu with Escape
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && mobileMenu.style.display === 'block') closeMobileMenu();
});

// Close when clicking outside the mobile-inner
mobileMenu?.addEventListener('click', (e)=>{
  if(e.target === mobileMenu) closeMobileMenu();
});

// Búsqueda y filtro para Consejos
(function(){
  const input = document.getElementById('buscar-consejo');
  const filtroBtns = Array.from(document.querySelectorAll('.filtro-btn'));
  const tarjetas = Array.from(document.querySelectorAll('#tarjetas-consejos .tarjeta-consejo'));

  // Filtrar por categoría
  filtroBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filtroBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      tarjetas.forEach(t=>{
        const cat = t.getAttribute('data-category') || 'otros';
        t.style.display = (filter === 'all' || filter === cat) ? '' : 'none';
      });
      input.value = '';
    });
  });

  // Búsqueda por texto
  input.addEventListener('input', ()=>{
    const q = input.value.trim().toLowerCase();
    const activeFilter = document.querySelector('.filtro-btn.active')?.getAttribute('data-filter') || 'all';
    tarjetas.forEach(t=>{
      const name = (t.getAttribute('data-name') || t.querySelector('.texto-consejo')?.textContent || '').toLowerCase();
      const matchesSearch = name.includes(q);
      const matchesFilter = (activeFilter === 'all') || (t.getAttribute('data-category') === activeFilter);
      t.style.display = (matchesSearch && matchesFilter) ? '' : 'none';
    });
  });

  // Tecla Escape limpia búsqueda
  input.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape'){ input.value = ''; input.dispatchEvent(new Event('input')); }
  });
})();

// Galería: pausa, lightbox y accesibilidad
(function(){
  const cinta = document.getElementById('cintaImagenes');
  const cintaWrap = document.querySelector('.cinta-galeria');
  const pauseBtn = document.getElementById('cintaPause');
  const imgs = Array.from(document.querySelectorAll('.cinta-imagenes img'));
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');

  // Toggle pausa
  pauseBtn?.addEventListener('click', ()=>{
    const paused = cintaWrap.classList.toggle('paused');
    pauseBtn.setAttribute('aria-pressed', String(paused));
    pauseBtn.textContent = paused ? 'Play' : 'Pause';
  });

  // Abrir lightbox al click o Enter
  let currentIndex = 0;
  function openLightbox(index){
    const img = imgs[index];
    const full = img.dataset.full || img.src;
    lbImg.src = full;
    lbImg.alt = img.alt || '';
    lbCaption.textContent = img.alt || '';
    lightbox.setAttribute('aria-hidden','false');
    lightbox.style.display = 'flex';
    currentIndex = index;
    // focus trap: focus close button
    lbClose.focus();
  }
  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true');
    lightbox.style.display = 'none';
    lbImg.src = '';
  }
  function showPrev(){ currentIndex = (currentIndex - 1 + imgs.length/2) % (imgs.length/2); openLightbox(currentIndex); }
  function showNext(){ currentIndex = (currentIndex + 1) % (imgs.length/2); openLightbox(currentIndex); }

  imgs.forEach((img, i)=>{
    img.addEventListener('click', ()=> openLightbox(i % (imgs.length/2)));
    img.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(i % (imgs.length/2)); }
    });
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', showPrev);
  lbNext?.addEventListener('click', showNext);

  // Keyboard navigation
  document.addEventListener('keydown', (e)=>{
    if(lightbox.getAttribute('aria-hidden') === 'false'){
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowLeft') showPrev();
      if(e.key === 'ArrowRight') showNext();
    }
  });

  // Click fuera para cerrar
  lightbox?.addEventListener('click', (e)=>{
    if(e.target === lightbox) closeLightbox();
  });

  // Pause on hover/focus for accessibility
  const pauseOnHover = true;
  if(pauseOnHover){
    cintaWrap.addEventListener('mouseenter', ()=> { cintaWrap.classList.add('paused'); pauseBtn.setAttribute('aria-pressed','true'); pauseBtn.textContent='Play'; });
    cintaWrap.addEventListener('mouseleave', ()=> { cintaWrap.classList.remove('paused'); pauseBtn.setAttribute('aria-pressed','false'); pauseBtn.textContent='Pause'; });
    // pause when any image receives focus
    imgs.forEach(img => img.addEventListener('focus', ()=> { cintaWrap.classList.add('paused'); }));
    imgs.forEach(img => img.addEventListener('blur', ()=> { cintaWrap.classList.remove('paused'); }));
  }

  // Ensure reduced motion preference respected
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.cinta-imagenes').forEach(el => el.style.animation = 'none');
  }
})();


