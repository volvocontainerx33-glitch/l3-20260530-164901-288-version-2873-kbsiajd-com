
(function(){
  const q = (sel, root=document) => root.querySelector(sel);
  const qa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const docReady = (fn) => document.readyState !== 'loading' ? fn() : document.addEventListener('DOMContentLoaded', fn);

  function initMobileMenu(){
    const btn = q('[data-menu-btn]');
    const menu = q('[data-mobile-menu]');
    if(!btn || !menu) return;
    btn.addEventListener('click', () => menu.classList.toggle('open'));
  }

  function initBackToTop(){
    const btn = q('[data-to-top]');
    if(!btn) return;
    const show = () => btn.classList.toggle('show', window.scrollY > 800);
    window.addEventListener('scroll', show, {passive:true});
    show();
    btn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }

  function initHero(){
    const hero = q('[data-hero-carousel]');
    if(!hero) return;
    const slides = qa('[data-hero-slide]', hero);
    const dotsWrap = q('[data-hero-dots]', hero);
    const prev = q('[data-hero-prev]', hero);
    const next = q('[data-hero-next]', hero);
    if(!slides.length) return;
    let idx = 0;
    const dots = slides.map((_, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.addEventListener('click', () => setIdx(i));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });
    function setIdx(nextIdx){
      idx = (nextIdx + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('active', i === idx));
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    }
    prev && prev.addEventListener('click', () => setIdx(idx - 1));
    next && next.addEventListener('click', () => setIdx(idx + 1));
    setIdx(0);
    let timer = setInterval(() => setIdx(idx + 1), 5000);
    hero.addEventListener('mouseenter', () => clearInterval(timer));
    hero.addEventListener('mouseleave', () => { timer = setInterval(() => setIdx(idx + 1), 5000); });
  }

  function initPageFilter(){
    const input = q('[data-filter-input]');
    const count = q('[data-filter-count]');
    const empty = q('[data-filter-empty]');
    const cards = qa('[data-filter-card]');
    const buttons = qa('[data-filter-chip]');
    if(!input || !cards.length) return;
    let active = 'all';
    const apply = () => {
      const term = input.value.trim().toLowerCase();
      let shown = 0;
      cards.forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const tags = (card.dataset.tags || '').toLowerCase();
        const year = (card.dataset.year || '').toLowerCase();
        const cat = (card.dataset.category || '').toLowerCase();
        const hitTerm = !term || title.includes(term) || tags.includes(term) || year.includes(term) || cat.includes(term);
        const hitCat = active === 'all' || (card.dataset.bucket || '').split('|').includes(active);
        const show = hitTerm && hitCat;
        card.style.display = show ? '' : 'none';
        if(show) shown += 1;
      });
      if(count) count.textContent = shown;
      if(empty) empty.style.display = shown ? 'none' : 'block';
    };
    input.addEventListener('input', apply);
    buttons.forEach(btn => btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      active = btn.dataset.filter || 'all';
      apply();
    }));
    apply();
  }

  function initPlayer(){
    const stage = q('[data-player-stage]');
    if(!stage) return;
    const video = q('video', stage);
    const overlay = q('[data-player-overlay]', stage);
    const playBtn = q('[data-player-play]', stage);
    const src = video && video.dataset.src;
    if(!video || !src) return;
    if(window.Hls && Hls.isSupported()){
      const hls = new Hls({enableWorker:true});
      hls.loadSource(src);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
    }
    const start = async () => {
      try {
        await video.play();
        if(overlay) overlay.style.display = 'none';
      } catch (e) {}
    };
    playBtn && playBtn.addEventListener('click', start);
    stage.addEventListener('click', (e) => {
      if(e.target === stage || e.target === video) start();
    });
    video.addEventListener('play', () => overlay && (overlay.style.display = 'none'));
    video.addEventListener('pause', () => overlay && (overlay.style.display = 'grid'));
  }

  function initSearch(){
    const box = q('[data-search-results]');
    const input = q('[data-search-input]');
    if(!box || !input || !window.MOVIE_DATA) return;
    const params = new URLSearchParams(location.search);
    input.value = params.get('q') || '';
    const render = () => {
      const term = input.value.trim().toLowerCase();
      const results = window.MOVIE_DATA.filter(item => {
        const hay = [item.title, item.description, item.category, item.region, item.type, (item.tags||[]).join(' '), item.year].join(' ').toLowerCase();
        return !term || hay.includes(term);
      });
      box.innerHTML = results.map(item => `
        <a class="card card-hover list-item" href="${item.slug}">
          <div class="movie-poster">
            <img src="${item.cover}" alt="${item.title}" loading="lazy">
            <span class="movie-badge">${item.year}</span>
          </div>
          <div class="movie-meta" style="padding:0">
            <h3>${item.title}</h3>
            <p>${item.description || ''}</p>
            <div class="movie-foot"><span>${item.category}</span><span>${item.region}</span></div>
            <div class="tag-list" style="margin-top:10px">${(item.tags||[]).slice(0,4).map(t => `<span class="tag gray">${t}</span>`).join('')}</div>
          </div>
        </a>
      `).join('');
      const empty = q('[data-search-empty]');
      if(empty) empty.style.display = results.length ? 'none' : 'block';
      const count = q('[data-search-count]');
      if(count) count.textContent = results.length;
    };
    input.addEventListener('input', render);
    render();
  }

  docReady(() => {
    initMobileMenu();
    initHero();
    initPageFilter();
    initPlayer();
    initSearch();
    initBackToTop();
  });
})();
