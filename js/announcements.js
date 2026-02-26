// js/announcements.js — implementación alternativa basada en transform (más fiable)
(function(){
  const section = document.getElementById('announcements');
  if(!section) return console.error('announcements.js: no se encontró #announcements');
  const track = document.getElementById('annTrack');
  if(!track) return console.error('announcements.js: no se encontró #annTrack');

  let slides = Array.from(track.querySelectorAll('.ann-slide'));
  if(slides.length === 0) return console.error('announcements.js: no hay .ann-slide dentro de #annTrack');

  const slidesToShow = Math.max(1, parseInt(section.getAttribute('data-slides')) || 1);
  const delay = 1000; // ms entre cambios
  const transitionMs = 300; // duración de la transición
  let index = 0;
  let timer = null;
  let isPaused = false;

  // Estilos necesarios en runtime
  track.style.display = 'flex';
  track.style.willChange = 'transform';
  track.style.transition = `transform ${transitionMs}ms ease`;

  // Asegurar que cada slide tenga box-sizing y flex-basis correcto
  function applySlideSizing(){
    const containerWidth = track.getBoundingClientRect().width;
    // Si slidesToShow == 1 -> cada slide ocupa 100% del viewport del track
    // Si slidesToShow == 2 -> cada slide ocupa 50% del track (ajusta gap en CSS)
    const visibleCount = slidesToShow;
    slides.forEach(slide => {
      slide.style.flex = `0 0 ${100 / visibleCount}%`;
      slide.style.maxWidth = `${100 / visibleCount}%`;
    });
  }

  // Mide y aplica posición por índice
  function updatePosition(animate = true){
    const trackRect = track.getBoundingClientRect();
    // ancho de un "paso" = ancho del track / slidesToShow
    const step = trackRect.width / slidesToShow;
    const translateX = -index * step;
    if(!animate){
      track.style.transition = 'none';
      track.style.transform = `translateX(${translateX}px)`;
      // forzar reflow y restaurar transition
      void track.offsetWidth;
      track.style.transition = `transform ${transitionMs}ms ease`;
    } else {
      track.style.transform = `translateX(${translateX}px)`;
    }
  }

  // Avanza índice con loop
  function next(){
    const total = slides.length;
    index = (index + 1) % total;
    updatePosition(true);
  }

  function start(){
    stop();
    timer = setInterval(()=> { if(!isPaused) next(); }, delay);
    console.log('announcements.js (transform): autoplay iniciado');
  }
  function stop(){
    if(timer){ clearInterval(timer); timer = null; console.log('announcements.js (transform): autoplay detenido'); }
  }

  // Pausa en hover/focus
  const viewport = section.querySelector('.ann-viewport') || track;
  viewport.addEventListener('mouseenter', ()=> { isPaused = true; });
  viewport.addEventListener('mouseleave', ()=> { isPaused = false; });
  viewport.addEventListener('focusin', ()=> { isPaused = true; });
  viewport.addEventListener('focusout', ()=> { isPaused = false; });

  // Navegación por teclado
  section.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight'){ next(); isPaused = true; stop(); }
    if(e.key === 'ArrowLeft'){ index = (index - 1 + slides.length) % slides.length; updatePosition(true); isPaused = true; stop(); }
  });

  // Recalcular en resize
  let resizeTimer = null;
  window.addEventListener('resize', ()=> {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(()=> { applySlideSizing(); updatePosition(false); }, 120);
  });

  // Inicializar después de que las imágenes carguen (para medidas correctas)
  function imagesLoaded(){
    const imgs = Array.from(track.querySelectorAll('img'));
    return Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => img.addEventListener('load', res, { once: true }))));
  }

  imagesLoaded().then(()=>{
    // remove any inline transform/transition left by previous scripts
    track.style.transform = 'translateX(0px)';
    applySlideSizing();
    updatePosition(false);
    start();
    // expose debug helpers
    window.__ann_debug = { track, slides, start, stop, next, updatePosition };
    console.log('announcements.js (transform): inicializado. slides:', slides.length, 'slidesToShow:', slidesToShow);
  }).catch(err=>{
    console.warn('announcements.js (transform): imagesLoaded fallo', err);
    applySlideSizing();
    updatePosition(false);
    start();
  });
})();
