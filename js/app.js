// ===== 状态 =====
let allData = [];
let currentPage = 'home';

// ===== DOM 引用 =====
const contentEl = document.getElementById('content');
const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const navItems = document.querySelectorAll('.nav-item');

// ===== 菜单切换（移动端） =====
menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

// 点击内容区关闭侧栏
contentEl.addEventListener('click', () => {
  if (window.innerWidth <= 700) {
    sidebar.classList.remove('open');
  }
});

// ===== 导航事件 =====
navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const page = item.dataset.page;
    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    sidebar.classList.remove('open');
    navigateTo(page);
  });
});

// ===== 路由 =====
function navigateTo(page) {
  currentPage = page;

  if (page === 'home') {
    renderHome();
    updateUrlHash('');
  } else if (page === 'about') {
    renderAbout();
    updateUrlHash('#/about');
  } else if (['游戏', '电影', '电视剧'].includes(page)) {
    renderTypePage(page);
    updateUrlHash(`#/${page}`);
  } else if (page.startsWith('detail-')) {
    const id = parseInt(page.replace('detail-', ''), 10);
    renderDetail(id);
    updateUrlHash(`#/detail/${id}`);
  }
}

function updateUrlHash(hash) {
  history.replaceState(null, '', window.location.pathname + hash);
}

// ===== 加载数据 =====
async function loadData() {
  contentEl.innerHTML = '<div class="loading"><div class="loading-spinner"></div><br>加载中...</div>';
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error('Failed to load data');
    allData = await res.json();
    handleInitialRoute();
  } catch (err) {
    contentEl.innerHTML = `<div class="empty-state">❌ 数据加载失败：${err.message}</div>`;
  }
}

function handleInitialRoute() {
  const hash = window.location.hash;
  if (hash.startsWith('#/detail/')) {
    const id = parseInt(hash.replace('#/detail/', ''), 10);
    const item = allData.find(d => d.id === id);
    if (item) {
      navItems.forEach(n => n.classList.remove('active'));
      renderDetail(id);
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

// ===== 渲染：首页 =====
function renderHome() {
  const types = ['游戏', '电影', '电视剧'];
  let html = '';

  types.forEach(type => {
    const items = allData.filter(d => d.type === type);
    if (items.length === 0) return;

    const high = items.filter(d => d.score >= 8);
    const mid = items.filter(d => d.score >= 6 && d.score <= 7);
    const low = items.filter(d => d.score <= 5);

    html += `<div class="section">`;
    html += `<h2 class="section-type-title">${type}</h2>`;

    if (high.length > 0) {
      html += `<div class="score-group"><div class="score-label">⭐ 高分（≥8）</div><div class="card-grid">`;
      high.forEach(item => { html += renderCard(item); });
      html += `</div></div>`;
    }

    if (mid.length > 0) {
      html += `<div class="score-group"><div class="score-label">👍 中分（6-7）</div><div class="card-grid">`;
      mid.forEach(item => { html += renderCard(item); });
      html += `</div></div>`;
    }

    if (low.length > 0) {
      html += `<div class="score-group"><div class="score-label">💔 低分（≤5）</div><div class="card-grid">`;
      low.forEach(item => { html += renderCard(item); });
      html += `</div></div>`;
    }

    html += `</div>`;
  });

  contentEl.innerHTML = html;
  attachCardEvents();
}

// ===== 渲染：分类页面 =====
function renderTypePage(type) {
  const items = allData.filter(d => d.type === type);
  if (items.length === 0) {
    contentEl.innerHTML = `<div class="empty-state">暂无"${type}"相关作品</div>`;
    return;
  }

  const high = items.filter(d => d.score >= 8);
  const mid = items.filter(d => d.score >= 6 && d.score <= 7);
  const low = items.filter(d => d.score <= 5);

  let html = `<h2 class="section-title">${type}</h2>`;

  if (high.length > 0) {
    html += `<div class="score-group"><div class="score-label">⭐ 高分（≥8）</div><div class="card-grid">`;
    high.forEach(item => { html += renderCard(item); });
    html += `</div></div>`;
  }

  if (mid.length > 0) {
    html += `<div class="score-group"><div class="score-label">👍 中分（6-7）</div><div class="card-grid">`;
    mid.forEach(item => { html += renderCard(item); });
    html += `</div></div>`;
  }

  if (low.length > 0) {
    html += `<div class="score-group"><div class="score-label">💔 低分（≤5）</div><div class="card-grid">`;
    low.forEach(item => { html += renderCard(item); });
    html += `</div></div>`;
  }

  contentEl.innerHTML = html;
  attachCardEvents();
}

// ===== 渲染：单个卡片 =====
function renderCard(item) {
  const coverImg = item.cover
    ? `<img class="card-cover" src="${item.cover}" alt="${item.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="card-cover-placeholder" style="display:none">🎬</div>`
    : `<div class="card-cover-placeholder">🎬</div>`;

  const tagsHtml = item.tags.slice(0, 3).map(t => `<span class="card-tag">${t}</span>`).join('');

  return `
    <div class="card" data-id="${item.id}">
      ${coverImg}
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

// ===== 卡片点击事件 =====
function attachCardEvents() {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id, 10);
      navItems.forEach(n => n.classList.remove('active'));
      renderDetail(id);
      updateUrlHash(`#/detail/${id}`);
    });
  });
}

// ===== 渲染：详情页 =====
function renderDetail(id) {
  const item = allData.find(d => d.id === id);
  if (!item) {
    contentEl.innerHTML = `<div class="empty-state">未找到该作品</div>`;
    return;
  }

  const coverHtml = item.cover
    ? `<img class="detail-cover" src="${item.cover}" alt="${item.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="detail-cover-placeholder" style="display:none">🎬</div>`
    : `<div class="detail-cover-placeholder">🎬</div>`;

  const tagsHtml = item.tags.map(t => `<span class="detail-tag">${t}</span>`).join('');

  const html = `
    <div class="detail-page">
      <button class="back-btn" id="backBtn">← 返回</button>
      <div class="detail-card">
        ${coverHtml}
        <div class="detail-body">
          <div class="detail-title">${item.title}</div>
          <div class="detail-type">${item.type}</div>
          <div class="detail-score">${item.score}</div>
          <div class="detail-tags">${tagsHtml}</div>
          <div class="detail-comment">${item.comment}</div>
        </div>
      </div>
    </div>
  `;

  contentEl.innerHTML = html;

  document.getElementById('backBtn').addEventListener('click', () => {
    navItems.forEach(n => {
      n.classList.remove('active');
      if (n.dataset.page === 'home') n.classList.add('active');
    });
    renderHome();
    updateUrlHash('');
  });
}

// ===== 渲染：关于页面 =====
function renderAbout() {
  contentEl.innerHTML = `
    <div class="about-page">
      <h2>ℹ️ 关于我的档案馆</h2>
      <p>这是一个个人娱乐作品档案馆，用于记录和展示我对游戏、电影、电视剧等娱乐作品的评价。</p>
      <p>所有数据以 JSON 格式本地存储，通过手动编辑 <code>data.json</code> 文件来增删改作品。</p>
      <p>封面图片放在 <code>covers/</code> 文件夹中，与项目一起部署。</p>
      <p style="margin-top:24px; font-size:14px; color:#999;">纯前端静态网站 · 无需服务器</p>
    </div>
  `;
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', loadData);
