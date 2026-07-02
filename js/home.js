// ===== 渲染：首页（个人主页） =====
function renderHome() {
  const gameCount = allData.filter(d => d.type === '游戏').length;
  const movieCount = allData.filter(d => d.type === '电影').length;
  const tvCount = allData.filter(d => d.type === '电视剧').length;
  const achievementCount = allData.filter(d => d.achievement === true).length;

  contentEl.innerHTML = `
    <div class="home-page">

      <!-- 太阳系头像区域 -->
      <div class="home-solar-system">
        <!-- 轨道 + 行星 -->
        <div class="orbit orbit-1"><div class="orbit-inner" style="animation-duration:7s"><div class="planet planet-1"></div></div></div>
        <div class="orbit orbit-2"><div class="orbit-inner" style="animation-duration:11s"><div class="planet planet-2"></div></div></div>
        <div class="orbit orbit-3"><div class="orbit-inner" style="animation-duration:4s"><div class="planet planet-3"></div></div></div>
        <div class="orbit orbit-4"><div class="orbit-inner" style="animation-duration:16s"><div class="planet planet-4"></div></div></div>
        <div class="orbit orbit-5"><div class="orbit-inner" style="animation-duration:6s"><div class="planet planet-5"></div></div></div>
        <div class="orbit orbit-6"><div class="orbit-inner" style="animation-duration:13s"><div class="planet planet-6"></div></div></div>
        <div class="orbit orbit-7"><div class="orbit-inner" style="animation-duration:9s"><div class="planet planet-7"></div></div></div>
        <div class="orbit orbit-8"><div class="orbit-inner" style="animation-duration:19s"><div class="planet planet-8"></div></div></div>
        <!-- 空轨迹（无行星，半径递增，颜色递减） -->
        <div class="orbit ghost-1"></div>
        <div class="orbit ghost-2"></div>
        <div class="orbit ghost-3"></div>
        <div class="orbit ghost-4"></div>
        <div class="orbit ghost-5"></div>
        <div class="orbit ghost-6"></div>
        <div class="orbit ghost-7"></div>

        <!-- 中心：头像 + 名字 -->
        <div class="solar-center">
          <div class="home-avatar">
            <img src="./covers/avatar.jpg" alt="Doerrin的头像" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <span class="home-avatar-placeholder" style="display:none">👤</span>
          </div>
          <h3 class="home-username">Ving</h3>
        </div>
      </div>

      <!-- WELCOME 大标题 -->
      <div class="home-welcome-title">WELCOME</div>

      <!-- 欢迎语卡片 -->
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

      <!-- 预留卡片 -->
      <div class="home-card home-card-placeholder">
        <p class="home-placeholder-text">🏗️ 更多内容即将到来……</p>
      </div>

      <div class="home-card home-card-placeholder">
        <p class="home-placeholder-text">🏗️ 更多内容即将到来……</p>
      </div>

    </div>
  `;
}
