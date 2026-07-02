// ===== 状态 =====
let allData = [];
let currentPage = 'home';
let currentFilter = 'score'; // 'overview' | 'score' | 'tag' | 'achievement'
let selectedTag = null;

// ===== DOM 引用 =====
const contentEl = document.getElementById('content');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const navItems = document.querySelectorAll('.nav-item');

// ===== DOM 引用 =====
const overlay = document.getElementById('sidebarOverlay');

// ===== 菜单切换 =====
menuToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = sidebar.classList.toggle('open');
  overlay.classList.toggle('active', isOpen);
});

// 点击遮罩层关闭侧边栏
overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
});

// ===== 导航事件 =====
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    navigateTo(page);
  });
});

// ===== 路由 =====
function navigateTo(page) {
  currentPage = page;

  if (page === 'home') {
    currentFilter = 'score';
    selectedTag = null;
    renderHome();
    updateUrlHash('');
  } else if (page === 'about') {
    currentFilter = 'score';
    selectedTag = null;
    renderAbout();
    updateUrlHash('#/about');
  } else if (['游戏', '电影', '电视剧'].includes(page)) {
    renderTypePage(page);
    updateUrlHash(`#/${page}`);
  } else if (page.startsWith('detail-')) {
    // 格式: detail-{type}-{id}
    const parts = page.replace('detail-', '').split('-');
    const id = parseInt(parts.pop(), 10);
    const type = parts.join('-');
    renderDetail(id, type);
    updateUrlHash(`#/detail/${type}/${id}`);
  }

  // 控制右侧按钮显示
  const headerRight = document.querySelector('.header-right');
  if (headerRight) {
    headerRight.style.display = (page === 'home') ? 'none' : '';
  }
}

function updateUrlHash(hash) {
  history.replaceState(null, '', window.location.pathname + hash);
}

// ===== 加载数据 =====
async function loadData() {
  contentEl.innerHTML = '<div class="loading"><div class="loading-spinner"></div><br>加载中...</div>';
  try {
    const files = ['./data/games.json', './data/movies.json', './data/tv.json'];
    const results = await Promise.all(files.map(url => fetch(url).then(r => {
      if (!r.ok) throw new Error(`加载 ${url} 失败`);
      return r.json();
    })));
    allData = results.flat();
    handleInitialRoute();
  } catch (err) {
    contentEl.innerHTML = `<div class="empty-state">❌ 数据加载失败：${err.message}</div>`;
  }
}

function handleInitialRoute() {
  const hash = window.location.hash;
  if (hash.startsWith('#/detail/')) {
    const path = hash.replace('#/detail/', '');
    const parts = path.split('/');
    const id = parseInt(parts.pop(), 10);
    const type = parts.join('/');
    const item = type ? allData.find(d => d.id === id && d.type === type) : allData.find(d => d.id === id);
    if (item) {
      navItems.forEach(n => n.classList.remove('active'));
      renderDetail(id, type || undefined);
      return;
    }
  } else if (hash.startsWith('#/')) {
    const page = hash.replace('#/', '');
    if (['游戏', '电影', '电视剧'].includes(page)) {
      navItems.forEach(n => {
        n.classList.remove('active');
        if (n.dataset.page === page) n.classList.add('active');
      });
      renderTypePage(page);
      return;
    }
    if (page === 'about') {
      navItems.forEach(n => {
        n.classList.remove('active');
        if (n.dataset.page === 'about') n.classList.add('active');
      });
      renderAbout();
      return;
    }
  }
  renderHome();
}

// ===== 渲染：分类页面 =====
function renderTypePage(type) {
  resetCardRenderCount();
  const items = allData.filter(d => d.type === type);
  if (items.length === 0) {
    contentEl.innerHTML = `<div class="empty-state">暂无"${type}"相关作品</div>`;
    return;
  }

  const allTags = [...new Set(items.flatMap(item => item.tags || []))];

  // 标题 + 筛选按钮
  let html = `
    <div class="type-header">
      <h2 class="section-title">${type}</h2>
      <div class="filter-wrapper">
        <button class="filter-btn" id="filterBtn">
          <span id="filterLabel">${getFilterLabel()}</span>
          <span class="filter-arrow">▾</span>
        </button>
        <div class="filter-dropdown" id="filterDropdown">
          <div class="filter-option${currentFilter === 'overview' ? ' active' : ''}" data-filter="overview">📋 总览</div>
          <div class="filter-option${currentFilter === 'score' ? ' active' : ''}" data-filter="score">⭐ 按分数排列</div>
          <div class="filter-option${currentFilter === 'tag' ? ' active' : ''}" data-filter="tag">🏷️ 按标签筛选</div>
          <div class="filter-option${currentFilter === 'achievement' ? ' active' : ''}" data-filter="achievement">🏆 全成就</div>
        </div>
      </div>
    </div>`;

  // 按当前筛选模式渲染内容
  if (currentFilter === 'overview') {
    // 总览：所有作品排在一起，按分数降序
    const sorted = [...items].sort((a, b) => b.score - a.score);
    html += `<div class="card-grid">`;
    sorted.forEach(item => { html += renderCard(item); });
    html += `</div>`;
  } else if (currentFilter === 'achievement') {
    // 全成就：只显示 achievement === true 的游戏
    const achieved = items.filter(item => item.achievement === true);
    if (achieved.length === 0) {
      html += `<div class="empty-state">暂无全成就作品</div>`;
    } else {
      const sorted = [...achieved].sort((a, b) => b.score - a.score || a.id - b.id);
      html += `<div class="card-grid">`;
      sorted.forEach(item => { html += renderCard(item); });
      html += `</div>`;
    }
  } else if (currentFilter === 'tag') {
    // 标签选择栏
    html += `<div class="tag-filter-bar">`;
    allTags.forEach(tag => {
      html += `<span class="tag-chip${tag === selectedTag ? ' active' : ''}" data-tag="${tag}">${tag}</span>`;
    });
    if (selectedTag) {
      html += `<span class="tag-chip tag-clear" data-tag="">✕ 清除筛选</span>`;
    }
    html += `</div>`;

    const filtered = selectedTag ? items.filter(item => (item.tags || []).includes(selectedTag)) : items;
    const sorted = [...filtered].sort((a, b) => b.score - a.score);

    if (sorted.length === 0) {
      html += `<div class="empty-state">暂无匹配"${selectedTag}"的作品</div>`;
    } else {
      html += `<div class="card-grid">`;
      sorted.forEach(item => { html += renderCard(item); });
      html += `</div>`;
    }
  } else {
    // 按分数排列（默认）：5级分级，2分一档，支持0.5分粒度
    const sortCards = (a, b) => b.score - a.score || a.id - b.id;
    const groups = [
      { key: 's1', items: items.filter(d => d.score >= 9).sort(sortCards), label: '⭐ 夯 A（9~10）' },
      { key: 's2', items: items.filter(d => d.score >= 8 && d.score < 9).sort(sortCards), label: '🔥 顶级 B（8~8.9）' },
      { key: 's3', items: items.filter(d => d.score >= 6 && d.score < 8).sort(sortCards), label: '👍 人上人 C（6~7.9）' },
      { key: 's4', items: items.filter(d => d.score >= 4 && d.score < 6).sort(sortCards), label: '💔 NPC D（4~5.9）' },
      { key: 's5', items: items.filter(d => d.score < 4).sort(sortCards), label: '💀 拉 E（0~3.9）' },
    ];
    groups.forEach(g => {
      if (g.items.length === 0) return;
      html += `<div class="score-group">
        <div class="score-label toggle-label">
          <span>${g.label}</span>
          <span class="collapse-arrow">▲</span>
        </div>
        <div class="card-grid">`;
      g.items.forEach(item => { html += renderCard(item); });
      html += `</div></div>`;
    });
  }

  contentEl.innerHTML = html;
  attachCardEvents();
  attachFilterEvents(type);
  attachCollapseEvents();
  setupPreloadObserver();
}

function attachCollapseEvents() {
  document.querySelectorAll('.toggle-label').forEach(label => {
    label.addEventListener('click', () => {
      const group = label.parentElement;
      const grid = group.querySelector('.card-grid');
      const arrow = label.querySelector('.collapse-arrow');
      if (grid) {
        grid.classList.toggle('collapsed');
        arrow.textContent = grid.classList.contains('collapsed') ? '▼' : '▲';
      }
    });
  });
}

function getFilterLabel() {
  if (currentFilter === 'overview') return '📋 总览';
  if (currentFilter === 'tag') return selectedTag ? `🏷️ ${selectedTag}` : '🏷️ 标签';
  if (currentFilter === 'achievement') return '🏆 全成就';
  return '⭐ 按分数';
}

function attachFilterEvents(type) {
  const filterBtn = document.getElementById('filterBtn');
  const filterDropdown = document.getElementById('filterDropdown');
  if (!filterBtn || !filterDropdown) return;

  // 切换下拉菜单
  filterBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    filterDropdown.classList.toggle('open');
  });

  // 选项点击
  filterDropdown.querySelectorAll('.filter-option').forEach(opt => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const filter = opt.dataset.filter;
      currentFilter = filter;
      if (filter !== 'tag') selectedTag = null;
      filterDropdown.classList.remove('open');
      renderTypePage(type);
    });
  });

  // 标签点击
  document.querySelectorAll('.tag-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = chip.dataset.tag;
      selectedTag = tag || null;
      renderTypePage(type);
    });
  });
}

// ===== 渲染：单个卡片 =====
function getSteamCoverUrl(steamDb) {
  if (!steamDb) return '';
  const m = steamDb.match(/\/app\/(\d+)/);
  if (m) return `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${m[1]}/capsule_616x353.jpg`;
  return steamDb;
}

let _cardRenderCount = 0;

function resetCardRenderCount() {
  _cardRenderCount = 0;
}

function renderCard(item) {
  const tags = item.tags || [];
  const hasAchievement = item.achievement === true;
  const loading = _cardRenderCount < 12 ? 'eager' : 'lazy';
  _cardRenderCount++;

  const steamCover = getSteamCoverUrl(item.steamDb);
  const hasSteamCover = !!steamCover;
  const primarySrc = steamCover || item.cover;
  const fallbackSrc = hasSteamCover ? (item.cover || '') : '';

  let coverImg;
  if (primarySrc) {
    if (fallbackSrc) {
      coverImg = `<img class="card-cover" src="${primarySrc}" alt="${item.title}" loading="${loading}" onerror="this.src='${fallbackSrc}';this.onerror=function(){this.style.display='none';this.nextElementSibling.style.display='flex';}"><div class="card-cover-placeholder" style="display:none">🎬</div>`;
    } else {
      coverImg = `<img class="card-cover" src="${primarySrc}" alt="${item.title}" loading="${loading}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';}"><div class="card-cover-placeholder" style="display:none">🎬</div>`;
    }
  } else {
    coverImg = `<div class="card-cover-placeholder">🎬</div>`;
  }

  const tagsHtml = tags.slice(0, 1).map(t => `<span class="card-tag">${t}</span>`).join('');
  const trophyBadge = hasAchievement ? `<span class="card-trophy">🏆</span>` : '';

  return `
    <div class="card" data-id="${item.id}" data-type="${item.type}">
      <div class="card-cover-wrap">
        ${coverImg}
        ${trophyBadge}
      </div>
      <div class="card-body">
        <div class="card-title">${item.title}</div>
        <div class="card-meta">
          <span class="card-score">${item.score}</span>
          <div class="card-tags">${tagsHtml}</div>
        </div>
      </div>
    </div>
  `;
}

// ===== 滚动预加载（IntersectionObserver） =====
let preloadObserver = null;

function setupPreloadObserver() {
  if (preloadObserver) preloadObserver.disconnect();

  preloadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        preloadObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '800px 0px',
    threshold: 0
  });

  document.querySelectorAll('.card-cover[loading="lazy"]').forEach(img => {
    const src = img.src;
    img.removeAttribute('src');
    img.dataset.src = src;
    preloadObserver.observe(img);
  });
}

// ===== 卡片点击事件 =====
function attachCardEvents() {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id, 10);
      const type = card.dataset.type;
      navItems.forEach(n => n.classList.remove('active'));
      renderDetail(id, type);
      updateUrlHash(`#/detail/${type}/${id}`);
    });
  });
}

// ===== 渲染：详情页 =====
function renderDetail(id, type) {
  if (!type) {
    // 旧格式兼容: detail-{id}，在所有数据中查找
    const item = allData.find(d => d.id === id);
    if (!item) {
      contentEl.innerHTML = `<div class="empty-state">未找到该作品</div>`;
      return;
    }
    renderDetailHtml(item);
    return;
  }
  const item = allData.find(d => d.id === id && d.type === type);
  if (!item) {
    contentEl.innerHTML = `<div class="empty-state">未找到该作品</div>`;
    return;
  }
  renderDetailHtml(item);
}

function renderDetailHtml(item) {

  // 封面获取方式和卡片一致
  const steamCover = getSteamCoverUrl(item.steamDb);
  const hasSteamCover = !!steamCover;
  const primarySrc = steamCover || item.cover;
  const fallbackSrc = hasSteamCover ? (item.cover || '') : '';

  let coverHtml;
  if (primarySrc) {
    if (fallbackSrc) {
      coverHtml = `<img class="detail-cover" src="${primarySrc}" alt="${item.title}" loading="lazy" onerror="this.src='${fallbackSrc}';this.onerror=function(){this.style.display='none';this.nextElementSibling.style.display='flex';}"><div class="detail-cover-placeholder" style="display:none">🎬</div>`;
    } else {
      coverHtml = `<img class="detail-cover" src="${primarySrc}" alt="${item.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';}"><div class="detail-cover-placeholder" style="display:none">🎬</div>`;
    }
  } else {
    coverHtml = `<div class="detail-cover-placeholder">🎬</div>`;
  }

  const detailTags = item.tags || [];
  const detailTagsHtml = detailTags.map(t => `<span class="detail-tag">${t}</span>`).join('');
  const detailComment = item.comment || '';

  const html = `
    <div class="detail-page">
      <button class="back-btn" id="backBtn">← 返回</button>
      <div class="detail-card">
        ${coverHtml}
        <div class="detail-body">
          <div class="detail-title">${item.title}</div>
          <div class="detail-type">${item.type}</div>
          <div class="detail-score">${item.score}</div>
          ${detailTagsHtml ? `<div class="detail-tags">${detailTagsHtml}</div>` : ''}
          ${detailComment ? `<div class="detail-comment">${detailComment}</div>` : ''}
        </div>
      </div>
    </div>
  `;

  contentEl.innerHTML = html;

  document.getElementById('backBtn').addEventListener('click', () => {
    navItems.forEach(n => {
      n.classList.remove('active');
      if (n.dataset.page === item.type) n.classList.add('active');
    });
    renderTypePage(item.type);
    updateUrlHash(`#/${item.type}`);
  });
}

// ===== 渲染：关于页面 =====
function renderAbout() {
  contentEl.innerHTML = `
    <div class="about-page">
      <h2>ℹ️ 关于赛博琥珀</h2>
      <p>所有封面均来自于steamDB或官方，如侵权请通知我更换。</p>
      <p>本仓库由copilot和deepseek协助开发。</p>
      <p style="margin-top:24px; font-size:14px; color:#999;">静态网站 · 无数据库和服务器功能</p>
    </div>
  `;
}

// ===== 搜索 =====
function renderSearchResults(query) {
  resetCardRenderCount();
  const keyword = query.trim().toLowerCase();
  if (!keyword) {
    renderHome();
    navItems.forEach(n => n.classList.remove('active'));
    if (navItems.length) navItems[0].classList.add('active');
    return;
  }

  const results = allData.filter(item =>
    item.title.toLowerCase().includes(keyword) ||
    (item.tags || []).some(tag => tag.toLowerCase().includes(keyword))
  );

  let html = `<div class="search-result-header">🔍 搜索"${query}" 共找到 ${results.length} 个结果</div>`;

  if (results.length === 0) {
    html += `<div class="empty-state">没有找到匹配的作品</div>`;
  } else {
    const sorted = [...results].sort((a, b) => b.score - a.score);
    html += `<div class="card-grid">`;
    sorted.forEach(item => { html += renderCard(item); });
    html += `</div>`;
  }

  contentEl.innerHTML = html;
  attachCardEvents();
  setupPreloadObserver();
}

function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  let debounceTimer;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const val = searchInput.value.trim();
      if (val) {
        navItems.forEach(n => n.classList.remove('active'));
        renderSearchResults(val);
        updateUrlHash('');
      } else {
        navItems.forEach(n => n.classList.remove('active'));
        if (navItems.length) navItems[0].classList.add('active');
        renderHome();
        updateUrlHash('');
      }
    }, 250);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchInput.blur();
      navItems.forEach(n => n.classList.remove('active'));
      if (navItems.length) navItems[0].classList.add('active');
      renderHome();
      updateUrlHash('');
    }
  });
}

// 点击页面其他区域关闭所有下拉菜单
document.addEventListener('click', () => {
  document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('open'));
});

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
  initSearch();
  loadData();
});
