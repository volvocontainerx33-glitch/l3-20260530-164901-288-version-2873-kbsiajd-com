(function(){
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => nav.classList.toggle('open'));
  }

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-slide]'));
    const thumbs = Array.from(hero.querySelectorAll('[data-thumb]'));
    const dots = Array.from(hero.querySelectorAll('[data-dot]'));
    const prev = hero.querySelector('[data-prev]');
    const next = hero.querySelector('[data-next]');
    let index = 0;
    let timer = null;
    const setActive = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((el, idx) => el.classList.toggle('active', idx === index));
      thumbs.forEach((el, idx) => el.classList.toggle('active', idx === index));
      dots.forEach((el, idx) => el.classList.toggle('active', idx === index));
    };
    const start = () => {
      stop();
      timer = window.setInterval(() => setActive(index + 1), 5000);
    };
    const stop = () => { if (timer) window.clearInterval(timer); timer = null; };
    if (slides.length) {
      slides.forEach((el, idx) => {
        const trigger = () => { setActive(idx); start(); };
        el.addEventListener('mouseenter', stop);
        el.addEventListener('mouseleave', start);
        const slideBtn = el.querySelector('[data-slide-open]');
        if (slideBtn) slideBtn.addEventListener('click', trigger);
      });
      thumbs.forEach((el, idx) => el.addEventListener('click', () => { setActive(idx); start(); }));
      dots.forEach((el, idx) => el.addEventListener('click', () => { setActive(idx); start(); }));
      if (prev) prev.addEventListener('click', () => { setActive(index - 1); start(); });
      if (next) next.addEventListener('click', () => { setActive(index + 1); start(); });
      setActive(0); start();
    }
  }

  const queryInput = document.querySelector('[data-search-input]');
  const queryBtn = document.querySelector('[data-search-btn]');
  const searchTarget = document.querySelector('[data-search-target]');
  const currentQuery = new URLSearchParams(window.location.search).get('q') || '';
  if (queryInput) queryInput.value = currentQuery;

  const goSearch = () => {
    const q = (queryInput?.value || '').trim();
    if (!q) return;
    window.location.href = 'search.html?q=' + encodeURIComponent(q);
  };
  if (queryBtn) queryBtn.addEventListener('click', goSearch);
  if (queryInput) {
    queryInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); goSearch(); } });
  }

  const filterScope = document.querySelector('[data-filter-scope]');
  const filterInput = document.querySelector('[data-filter-input]');
  if (filterScope && filterInput) {
    const items = Array.from(filterScope.querySelectorAll('[data-filter-item]'));
    const apply = () => {
      const q = filterInput.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((el) => {
        const hay = (el.getAttribute('data-search-text') || el.textContent || '').toLowerCase();
        const hit = !q || hay.includes(q);
        el.style.display = hit ? '' : 'none';
        if (hit) shown += 1;
      });
      const empty = filterScope.querySelector('[data-empty-state]');
      if (empty) empty.style.display = shown ? 'none' : 'block';
    };
    filterInput.addEventListener('input', apply);
    apply();
  }

  const dynamicSearch = document.querySelector('[data-site-search-results]');
  if (dynamicSearch) {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').trim().toLowerCase();
    const data = window.SEARCH_INDEX || [];
    {
      const results = !q ? [] : data.filter(item => {
        const hay = [item.title, item.one_line, item.summary, item.review, item.region, item.genre, item.category, (item.tags || []).join(' ')].join(' ').toLowerCase();
        return hay.includes(q);
      });
      const total = dynamicSearch.querySelector('[data-result-total]');
      const list = dynamicSearch.querySelector('[data-result-list]');
      const empty = dynamicSearch.querySelector('[data-result-empty]');
      if (total) total.textContent = results.length;
      if (!list) return;
      if (!results.length) {
        if (empty) empty.style.display = 'block';
        list.innerHTML = '';
        return;
      }
      if (empty) empty.style.display = 'none';
      const poster = (title) => 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 900"><rect width="640" height="900" fill="#0f172a"/><rect width="640" height="900" fill="rgba(245,158,11,.16)"/><text x="54" y="140" fill="#fff" font-family="Arial,\'PingFang SC\',\'Microsoft YaHei\',sans-serif" font-size="54" font-weight="800">${title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</text></svg>`)));
      list.innerHTML = results.map(item => `
        <a class="card" href="${item.url}">
          <div class="poster">
            <img src="${poster(item.title)}" alt="${item.title}">
            <div class="overlay"></div>
            <div class="meta">
              <div class="topline">
                <span class="badge">${item.category}</span>
                <span class="badge">${item.year}</span>
              </div>
              <h3>${item.title}</h3>
              <p>${item.one_line || item.summary || ''}</p>
            </div>
          </div>
          <div class="card-body">
            <div class="stat-row"><span>地区 ${item.region}</span><span>类型 ${item.type}</span></div>
          </div>
        </a>
      `).join('');
    }
  }
})();
