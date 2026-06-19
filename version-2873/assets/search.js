(function () {
  var input = document.querySelector('[data-global-search]');
  var results = document.querySelector('[data-search-results]');
  var count = document.querySelector('[data-search-count]');

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="movie/' + movie.file + '">',
      '    <div class="movie-thumb">',
      '      <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <div class="play-badge"><span>▶</span></div>',
      '    </div>',
      '    <div class="movie-body">',
      '      <h3 class="movie-title">' + escapeHtml(movie.title) + '</h3>',
      '      <p class="movie-line">' + escapeHtml(movie.one_line) + '</p>',
      '      <div class="card-meta">',
      '        <span class="pill">' + movie.year + '</span>',
      '        <span class="pill">' + escapeHtml(movie.type) + '</span>',
      '        <span class="pill">' + escapeHtml(movie.category_name) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function render() {
    var keyword = input.value.trim().toLowerCase();
    var pool = Array.isArray(window.SEARCH_MOVIES) ? window.SEARCH_MOVIES : [];
    var matched = keyword
      ? pool.filter(function (movie) {
          return movie.search.indexOf(keyword) !== -1;
        }).slice(0, 80)
      : pool.slice(0, 24);

    results.innerHTML = matched.map(card).join('');
    count.textContent = keyword ? '共找到 ' + matched.length + ' 条相关影片' : '输入关键词可搜索全部影片，当前展示热门内容';
  }

  if (input && results) {
    input.addEventListener('input', render);
    render();
  }
})();
