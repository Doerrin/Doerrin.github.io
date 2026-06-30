// ===== 渲染：首页（个人主页） =====
function renderHome() {
  const gameCount = allData.filter(d => d.type === '游戏').length;
  const movieCount = allData.filter(d => d.type === '电影').length;
  const tvCount = allData.filter(d => d.type === '电视剧').length;
  const achievementCount = allData.filter(d => d.achievement === true).length;

  contentEl.innerHTML = `
    <div class="home-page">

      <!-- 卡片 1：头像区域 -->
      <div class="home-card home-card-avatar">
        <div class="home-avatar-wrap">
          <div class="home-avatar">
            <img src="./covers/avatar.jpg" alt="Doerrin的头像" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span class="home-avatar-placeholder" style="display:none">👤</span>
          </div>
        </div>
        <h3 class="home-username">Ving</h3>
      </div>

      <!-- 卡片 2：欢迎语 -->
      <div class="home-card home-card-welcome">
        <h2>欢迎来到我的赛博琥珀！</h2>
        <p>这是一个个人娱乐档案馆，记录着我玩过的游戏、看过的电影等等。</p>
        <p>每一部作品都附带了主观评分和碎碎念，纯粹是个人向的记录。</p>
        <p>希望你能在这里发现共同兴趣！ 🎮🎬📺</p>
        <div class="home-stats-row">
          <span>🎮 ${gameCount} 款游戏</span>
          <span>🎬 ${movieCount} 部电影</span>
          <span>📺 ${tvCount} 部剧集</span>
          <span>🏆 ${achievementCount} 个全成就</span>
        </div>
      </div>

      <!-- 卡片 3：预留区域 -->
      <div class="home-card home-card-placeholder">
        <p class="home-placeholder-text">🏗️ 更多内容即将到来……</p>
      </div>

      <!-- 卡片 4：预留区域 -->
      <div class="home-card home-card-placeholder">
        <p class="home-placeholder-text">🏗️ 更多内容即将到来……</p>
      </div>

    </div>
  `;
}
