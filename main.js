/* ================================================
   侨批记忆 · 主逻辑
   包含：初始化、导航、各模块交互、游戏逻辑
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =============== 初始化 AOS ===============
  AOS.init({
    duration: 800,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80
  });

  // =============== 导航 ===============
  const mainNav = document.getElementById('mainNav');
  const navMenu = document.getElementById('navMenu');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollIndicator = document.querySelector('.indicator-line');

  // 滚动监听
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;

    // 导航样式
    if (scrollY > 50) mainNav.classList.add('scrolled');
    else mainNav.classList.remove('scrolled');

    // 进度条
    if (scrollIndicator) scrollIndicator.style.height = progress + '%';

    // 返回顶部
    const btn = document.getElementById('backToTop');
    if (btn) {
      if (scrollY > 400) btn.classList.add('visible');
      else btn.classList.remove('visible');
    }

    // 更新当前 section
    updateActiveNav();
  });

  // 移动端菜单
  if (navToggle) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('open'));
  }
  navLinks.forEach(link => {
    link.addEventListener('click', () => navMenu.classList.remove('open'));
  });

  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const offset = 150;
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - offset) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // 返回顶部
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // =============== Hero 数据统计 ===============
  const statNumbers = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        const unit = el.dataset.unit || '';
        animateNumber(el, target, unit);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(el => statObserver.observe(el));

  function animateNumber(el, target, unit) {
    const duration = 2000;
    const start = performance.now();
    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * ease);
      el.innerHTML = current + '<span class="stat-unit">' + unit + '</span>';
      if (progress < 1) requestAnimationFrame(update);
      else el.innerHTML = target + '<span class="stat-unit">' + unit + '</span>';
    }
    requestAnimationFrame(update);
  }

  // =============== 精神长廊数据 ===============
  const spiritNum = document.querySelector('.spirit-big-number .num');
  if (spiritNum) {
    const spiritObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateNumber(spiritNum, 13, '');
          spiritObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    spiritObs.observe(spiritNum.parentElement);
  }

  // =============== 档案柜模块 ===============
  initArchive();

  // =============== 游戏模块 ===============
  initGames();

  // =============== 剧本杀模块 ===============
  initStory();

  // =============== 互动留言 ===============
  initMessageWriter();

  // =============== GSAP 额外效果 ===============
  // 信封视差
  if (window.gsap && document.querySelector('.envelope-bg')) {
    const envelopeBg = document.querySelector('.envelope-bg');
    window.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      envelopeBg.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

});

/* ================================================
   档案柜模块
   ================================================ */
function initArchive() {
  const tabsContainer = document.getElementById('drawerTabs');
  const container = document.getElementById('letterContainer');
  const randomBtn = document.getElementById('randomBtn');
  const lightbox = document.getElementById('lightbox');
  const lightboxContent = document.getElementById('lightboxContent');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  const archives = QiaoPiData.archives;
  const categories = ['全部', '清末民初', '抗战时期', '新中国成立后', '思乡篇', '嘱托篇', '家国篇'];
  let currentCategory = '全部';
  let currentIndex = 0;

  // 生成标签
  categories.forEach(cat => {
    const tab = document.createElement('button');
    tab.className = 'drawer-tab' + (cat === '全部' ? ' active' : '');
    tab.textContent = cat;
    tab.addEventListener('click', () => {
      document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = cat;
      const filtered = filterArchives(cat);
      currentIndex = 0;
      renderLetter(filtered[0]);
      renderPager(filtered);
    });
    tabsContainer.appendChild(tab);
  });

  function filterArchives(cat) {
    if (cat === '全部') return archives;
    return archives.filter(a => a.era === cat || a.category === cat);
  }

  function renderLetter(data) {
    if (!data) {
      container.innerHTML = '<p style="text-align:center;color:#999;">暂无此分类下的侨批</p>';
      return;
    }
    container.innerHTML = `
      <div class="letter-card flipping" id="letterCard">
        <div class="letter-meta">
          <div>
            <div class="letter-id">档案编号 · ${data.id}</div>
            <div class="letter-location">${data.year} <span>✈</span> ${data.from} <span>→</span> ${data.to}</div>
          </div>
          <div style="text-align:right;">
            <span class="seal-tag">${data.category}</span>
          </div>
        </div>
        <div class="letter-content">
          <div class="letter-original">
            <div class="letter-paper-img" id="paperImg">
              <div class="letter-original-text">${data.original.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
          <div class="letter-interpret">
            <div class="interpret-label">✎ 白话转述</div>
            <div class="interpret-text" id="interpretText"></div>
          </div>
        </div>
        <div class="letter-background">
          <button class="bg-toggle" id="bgToggle">展开背景故事</button>
          <div class="bg-content" id="bgContent">${data.background}</div>
        </div>
        <div class="letter-tags">
          ${data.tags.map(t => `<span class="seal-tag">${t}</span>`).join('')}
        </div>
      </div>
      <div class="letter-pager" style="text-align:center;margin-top:1.5rem;color:#8B6914;font-family:var(--font-serif);font-size:0.9rem;">
        ${currentIndex + 1} / ${filterArchives(currentCategory).length}
      </div>
    `;

    // 移除 flip 动画 class
    setTimeout(() => document.getElementById('letterCard')?.classList.remove('flipping'), 600);

    // 打字机
    typeWriter(data.interpret.replace(/\n/g, '\n'), document.getElementById('interpretText'), 30);

    // 背景切换
    document.getElementById('bgToggle').addEventListener('click', () => {
      const bg = document.getElementById('bgContent');
      const toggle = document.getElementById('bgToggle');
      bg.classList.toggle('open');
      toggle.textContent = bg.classList.contains('open') ? '收起背景故事' : '展开背景故事';
    });

    // 点击放大
    document.getElementById('paperImg').addEventListener('click', () => {
      lightboxContent.innerHTML = `
        <h3 style="font-family:var(--font-serif);color:var(--gold);margin-bottom:1rem;">${data.id}</h3>
        <div style="font-family:var(--font-serif);line-height:2;color:var(--ink);white-space:pre-wrap;">${data.original}</div>
      `;
      lightbox.classList.add('open');
    });
  }

  function renderPager(filtered) {
    // 分页器
  }

  function typeWriter(text, el, speed = 30) {
    el.innerHTML = '';
    el.classList.add('typing-cursor');
    const lines = text.split('\n');
    let i = 0, lineIdx = 0;
    const next = () => {
      if (lineIdx >= lines.length) { el.classList.remove('typing-cursor'); return; }
      const char = lines[lineIdx][i];
      if (char === undefined) {
        el.innerHTML += '<br>';
        lineIdx++; i = 0;
        setTimeout(next, speed);
        return;
      }
      el.innerHTML += char;
      i++;
      setTimeout(next, speed);
    };
    next();
  }

  // 灯箱关闭
  lightboxClose?.addEventListener('click', () => lightbox.classList.remove('open'));
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('open');
  });

  // 随机
  randomBtn?.addEventListener('click', () => {
    const filtered = filterArchives(currentCategory);
    const randomIdx = Math.floor(Math.random() * filtered.length);
    currentIndex = randomIdx;
    renderLetter(filtered[randomIdx]);
  });

  // 初始渲染
  renderLetter(archives[0]);
}

/* ================================================
   游戏模块
   ================================================ */
function initGames() {
  const modal = document.getElementById('gameModal');
  const closeBtn = document.getElementById('gameClose');
  const body = document.getElementById('gameModalBody');
  const cards = document.querySelectorAll('.game-card');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.dataset.game;
      openGame(type);
    });
  });
  closeBtn?.addEventListener('click', closeGame);
  modal?.querySelector('.game-modal-bg')?.addEventListener('click', closeGame);

  function openGame(type) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (type === 'sort') initSortGame();
    else if (type === 'choice') initChoiceGame();
    else if (type === 'quiz') initQuizGame();
  }
  function closeGame() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    body.innerHTML = '';
  }

  // ========== 游戏一：排序 ==========
  let sortTimer, sortStartTime, sortCurrentLevel = 0, sortStars = 0, sortDraggable;
  function initSortGame() {
    sortCurrentLevel = 0;
    renderSortLevel();
  }

  function renderSortLevel() {
    const level = QiaoPiData.sortGame[sortCurrentLevel];
    const sentences = [...level.sentences].sort(() => Math.random() - 0.5);
    body.innerHTML = `
      <div class="sort-game">
        <h2>批句还原 · ${level.title}</h2>
        <div class="level-info">
          <span class="timer">⏱️ 计时中...</span>
          <span style="margin-left:1rem;color:#8B6914;">第 ${sortCurrentLevel + 1} / ${QiaoPiData.sortGame.length} 关</span>
        </div>
        <p style="text-align:center;color:#666;margin-bottom:1.5rem;">${level.hint}</p>
        <ul class="sentence-list" id="sentenceList">
          ${sentences.map((s, i) => `<li class="sentence-item" draggable="true" data-orig="${level.sentences.indexOf(s)}">${s}</li>`).join('')}
        </ul>
        <div class="btn-row">
          <button class="game-btn primary" id="sortCheck">✓ 检查答案</button>
          <button class="game-btn ghost" id="sortShuffle">↻ 重新打乱</button>
        </div>
      </div>
    `;
    // 计时
    sortStartTime = Date.now();
    clearInterval(sortTimer);
    sortTimer = setInterval(() => {
      const s = Math.floor((Date.now() - sortStartTime) / 1000);
      document.querySelector('.timer').textContent = `⏱️ ${s}秒`;
    }, 1000);
    // 拖拽
    sortDraggable = new Sortable(document.getElementById('sentenceList'), {
      animation: 200,
      handle: '.sentence-item',
      ghostClass: 'dragging'
    });
    // 事件
    document.getElementById('sortCheck').onclick = checkSortAnswer;
    document.getElementById('sortShuffle').onclick = renderSortLevel;
  }

  function checkSortAnswer() {
    const list = document.getElementById('sentenceList');
    const items = [...list.children];
    let correct = true;
    items.forEach((item, i) => {
      if (parseInt(item.dataset.orig) !== i) correct = false;
      item.classList.toggle('correct', parseInt(item.dataset.orig) === i);
    });
    if (correct) {
      clearInterval(sortTimer);
      const time = Math.floor((Date.now() - sortStartTime) / 1000);
      // 星级
      sortStars = time < 15 ? 3 : time < 30 ? 2 : 1;
      const level = QiaoPiData.sortGame[sortCurrentLevel];
      setTimeout(() => {
        body.innerHTML = `
          <div class="result-card">
            <h2>🎉 恭喜还原成功！</h2>
            <div class="stars">
              ${[1,2,3].map(n => n <= sortStars ? '★' : '<span class="off">★</span>').join('')}
            </div>
            <p style="color:#666;">用时 ${time} 秒</p>
            <div class="result-letter">
              <div style="color:#8B6914;font-size:0.9rem;margin-bottom:0.5rem;">📜 完整信件</div>
              ${level.sentences.join('<br>')}
            </div>
            <p class="result-comment">"${level.comment}"</p>
            <div class="btn-row" style="margin-top:1.5rem;">
              ${sortCurrentLevel < QiaoPiData.sortGame.length - 1
                ? `<button class="game-btn primary" id="nextLevel">下一关 →</button>`
                : `<button class="game-btn primary" id="finishGame">完成游戏 ✓</button>`}
            </div>
          </div>
        `;
        if (document.getElementById('nextLevel')) {
          document.getElementById('nextLevel').onclick = () => { sortCurrentLevel++; renderSortLevel(); };
        }
        if (document.getElementById('finishGame')) {
          document.getElementById('finishGame').onclick = closeGame;
        }
      }, 800);
    }
  }

  // ========== 游戏二：剧情选择 ==========
  let choiceSteps = [], choiceHistory = [];
  function initChoiceGame() {
    const game = QiaoPiData.choiceGame;
    choiceSteps = [...game.steps];
    choiceHistory = [];
    body.innerHTML = `
      <div class="choice-game">
        <h2>见字如面 · ${game.title}</h2>
        <div style="padding:2rem;background:rgba(139,105,20,0.06);border-radius:8px;margin-bottom:2rem;font-family:var(--font-serif);line-height:2;">
          ${game.intro}
        </div>
        <button class="game-btn primary" id="startChoice">▶ 开始写信</button>
      </div>
    `;
    document.getElementById('startChoice').onclick = () => renderChoiceStep(0);
  }

  function renderChoiceStep(idx) {
    if (idx >= choiceSteps.length) { showChoiceEnding(); return; }
    const step = choiceSteps[idx];
    body.innerHTML = `
      <div class="choice-game">
        <h2 style="font-size:1.3rem;">问题 ${idx + 1} / ${choiceSteps.length}</h2>
        <div class="choice-scene">
          <h3>✒️ 第 ${step.id} 封的抉择</h3>
          <p>${step.prompt}</p>
        </div>
        <div class="choice-options">
          ${step.options.map((opt, i) => `<button class="choice-opt" data-idx="${i}">${String.fromCharCode(65 + i)}. ${opt.text}</button>`).join('')}
        </div>
        <div class="choice-fact" style="display:none;">💡 ${step.fact}</div>
      </div>
    `;
    document.querySelectorAll('.choice-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        choiceHistory.push({ question: step.prompt, choice: step.options[i].text, tags: step.options[i].tags });
        document.querySelectorAll('.choice-opt').forEach(b => b.style.pointerEvents = 'none');
        document.querySelector('.choice-fact').style.display = 'block';
        setTimeout(() => renderChoiceStep(idx + 1), 1800);
      });
    });
  }

  function showChoiceEnding() {
    // 计算最终选择对应的结局
    const allTags = choiceHistory.flatMap(h => h.tags);
    let ending = QiaoPiData.choiceGame.endings.find(e =>
      e.condition.every(c => allTags.includes(c))
    );
    if (!ending) ending = QiaoPiData.choiceGame.endings[Math.floor(Math.random() * 3)];

    body.innerHTML = `
      <div class="choice-game">
        <h2>✉️ 你的侨批</h2>
        <div style="padding:2rem;background:linear-gradient(145deg,#FAF5EB,#EDE4D3);border:1px solid #8B6914;border-radius:8px;font-family:var(--font-serif);line-height:2;margin:1.5rem 0;text-align:left;">
          ${ending.letterPreview.replace(/\n/g, '<br>')}
        </div>
        <h3 style="color:#8B6914;margin-top:2rem;">📖 你的结局</h3>
        <p style="font-size:1.1rem;font-weight:600;color:#2C2C2C;margin:1rem 0;">${ending.title}</p>
        <p style="line-height:2;color:#4A4A4A;">${ending.content}</p>
        <div class="btn-row" style="margin-top:2rem;">
          <button class="game-btn ghost" id="replayChoice">↻ 再玩一次</button>
          <button class="game-btn primary" onclick="document.getElementById('gameClose').click()">完成</button>
        </div>
      </div>
    `;
    document.getElementById('replayChoice').onclick = initChoiceGame;
  }

  // ========== 游戏三：问答 ==========
  let quizIdx = 0, quizScore = 0, quizCombo = 0, quizAnswered = false;
  function initQuizGame() {
    quizIdx = 0; quizScore = 0; quizCombo = 0; quizAnswered = false;
    renderQuiz();
  }

  function renderQuiz() {
    const data = QiaoPiData.quizGame;
    if (quizIdx >= data.length) { showQuizEnd(); return; }
    quizAnswered = false;
    const q = data[quizIdx];
    body.innerHTML = `
      <div class="quiz-game">
        <div class="progress"><div class="progress-bar" style="width:${(quizIdx / data.length) * 100}%"></div></div>
        <div class="quiz-header">
          <div class="quiz-score">🏆 ${quizScore} 分</div>
          <div class="quiz-combo ${quizCombo > 1 ? 'active' : ''}">🔥 Combo ×${quizCombo}</div>
          <div style="font-family:var(--font-serif);color:#8B6914;">${quizIdx + 1} / ${data.length}</div>
        </div>
        <div class="quiz-question">${q.q}</div>
        <div class="quiz-options">
          ${q.options.map((opt, i) => `<button class="quiz-opt" data-opt="${i}">${String.fromCharCode(65 + i)}. ${opt}</button>`).join('')}
        </div>
        <div id="quizExplain" style="margin-top:1.5rem;padding:1rem;background:rgba(139,105,20,0.08);border-radius:4px;color:#4A4A4A;font-size:0.9rem;display:none;"></div>
      </div>
    `;
    document.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        if (quizAnswered) return;
        quizAnswered = true;
        const i = parseInt(btn.dataset.opt);
        const correct = i === q.answer;
        document.querySelectorAll('.quiz-opt').forEach(b => b.style.pointerEvents = 'none');
        if (correct) {
          btn.classList.add('correct');
          quizCombo++;
          const pts = 100 * quizCombo;
          quizScore += pts;
          playBeep(800, 0.1);
        } else {
          btn.classList.add('wrong');
          document.querySelector(`.quiz-opt[data-opt="${q.answer}"]`).classList.add('correct');
          quizCombo = 0;
          playBeep(200, 0.2);
        }
        const exp = document.getElementById('quizExplain');
        exp.style.display = 'block';
        exp.innerHTML = (correct ? '✅ ' : '❌ ') + q.explain;
        setTimeout(() => { quizIdx++; renderQuiz(); }, 2500);
      });
    });
  }

  function showQuizEnd() {
    const data = QiaoPiData.quizGame;
    let title, desc;
    if (quizScore >= 800) { title = '侨批守护者'; desc = '你对侨批文化了如指掌，堪称守护者！'; }
    else if (quizScore >= 500) { title = '侨批传承人'; desc = '你对侨批文化有深刻理解，继续传承吧！'; }
    else { title = '侨批小学徒'; desc = '新手上路，欢迎继续了解侨批文化！'; }
    body.innerHTML = `
      <div class="result-card">
        <h2>🎉 闯关结束</h2>
        <div style="font-family:var(--font-serif);font-size:2.5rem;color:#8B6914;margin:1rem 0;">${quizScore} 分</div>
        <div class="spirit-seal" style="display:inline-block;transform:none;">传承</div>
        <h3 style="font-family:var(--font-serif);color:#8B6914;margin:1rem 0;">${title}</h3>
        <p style="color:#666;margin-bottom:2rem;">${desc}</p>
        <div class="btn-row">
          <button class="game-btn ghost" id="replayQuiz">↻ 再挑战一次</button>
          <button class="game-btn primary" onclick="document.getElementById('gameClose').click()">完成</button>
        </div>
      </div>
    `;
    document.getElementById('replayQuiz').onclick = initQuizGame;
  }

  // 音效
  let audioCtx;
  function playBeep(freq, dur) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0.2;
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch(e) {}
  }
}

/* ================================================
   剧本杀模块
   ================================================ */
function initStory() {
  const storyBtn = document.getElementById('startStoryBtn');
  const modal = document.getElementById('storyModal');
  const closeBtn = document.getElementById('storyClose');
  const sceneDiv = document.getElementById('storyScene');
  const statBars = document.querySelectorAll('.bar-fill');

  let currentScene = 0;
  let stats = { family: 3, career: 3, hometown: 3 };

  storyBtn?.addEventListener('click', () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    currentScene = 0;
    stats = { family: 3, career: 3, hometown: 3 };
    updateStatBars();
    renderScene();
    // 播放背景音提示
    playStoryAmbient();
  });
  closeBtn?.addEventListener('click', () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  });

  function updateStatBars() {
    statBars.forEach(bar => {
      const key = bar.dataset.stat;
      const val = Math.max(0, Math.min(10, stats[key]));
      bar.style.width = (val * 10) + '%';
    });
  }

  function renderScene() {
    const scenes = QiaoPiData.storyGame.scenes;
    if (currentScene >= scenes.length) { renderEnding(); return; }
    const scene = scenes[currentScene];

    let events = '';
    if (scene.event) events = `<div class="scene-event">${scene.event}</div>`;

    sceneDiv.innerHTML = `
      <div class="scene-chapter">${scene.chapter}</div>
      <div class="scene-narrative">${scene.narrative.replace(/\n\n/g, '</p><p style="text-indent:2em;margin-top:1rem;">')}</div>
      ${events}
      ${scene.letterHint ? `<div class="scene-letter-hint">✉️ ${scene.letterHint}</div>` : ''}
      <div class="scene-options">
        ${scene.options.map((opt, i) => `<button class="scene-opt" data-idx="${i}">${opt.text}</button>`).join('')}
      </div>
    `;

    // 翻页动画重置
    sceneDiv.style.animation = 'none';
    sceneDiv.offsetHeight; // trigger reflow
    sceneDiv.style.animation = '';

    sceneDiv.querySelectorAll('.scene-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = parseInt(btn.dataset.idx);
        const eff = scene.options[i].effects;
        if (eff.family) stats.family += eff.family;
        if (eff.career) stats.career += eff.career;
        if (eff.hometown) stats.hometown += eff.hometown;
        updateStatBars();
        currentScene++;
        setTimeout(renderScene, 500);
      });
    });
  }

  function renderEnding() {
    const endings = QiaoPiData.storyGame.endings;
    let ending;
    if (stats.family >= 8) ending = endings.return_happy;
    else if (stats.hometown >= 6) ending = endings.education;
    else if (stats.family <= 0) ending = endings.separation;
    else ending = endings.heritage;

    const pathReview = [
      '你踏上了前往马来亚的轮船',
      '在橡胶园里开始了艰苦的打拼',
      '收到家乡来信，得知母亲的状况',
      '经历了日军南侵的苦难岁月',
      '战后重新开通侨批',
      '面临回乡与留下的抉择',
    ];

    sceneDiv.innerHTML = `
      <div class="ending-card">
        <div class="ending-emoji">${ending.emoji}</div>
        <div class="ending-title">${ending.title}</div>
        <p style="font-family:var(--font-serif);line-height:2;color:#2C2C2C;text-indent:2em;margin-bottom:1.5rem;">${ending.narrative}</p>
        <div class="ending-path">
          <div style="font-family:var(--font-serif);color:#8B6914;margin-bottom:0.5rem;">🗺️ 你的选择路径：</div>
          ${pathReview.map((p, i) => `<div>${i + 1}. ${p}</div>`).join('')}
        </div>
        <div class="ending-history">📚 ${ending.history}</div>
        <button class="game-btn primary" onclick="document.getElementById('storyClose').click()">完成 · 回到传承</button>
      </div>
    `;
  }

  // 环境音
  let storyAudioCtx;
  function playStoryAmbient() {
    try {
      storyAudioCtx = storyAudioCtx || new (window.AudioContext || window.webkitAudioContext)();
      // 低沉氛围音
      const osc = storyAudioCtx.createOscillator();
      const gain = storyAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 110;
      gain.gain.value = 0.03;
      osc.connect(gain); gain.connect(storyAudioCtx.destination);
      osc.start();
      osc.frequency.linearRampToValueAtTime(80, storyAudioCtx.currentTime + 4);
      setTimeout(() => osc.stop(), 4000);
    } catch(e) {}
  }
}

/* ================================================
   互动留言模块
   ================================================ */
function initMessageWriter() {
  const paper = document.getElementById('writerPaper');
  const sealBtn = document.getElementById('sealBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const resetBtn = document.getElementById('resetBtn');
  const stampPreview = document.getElementById('stampPreview');
  const customSeal = document.getElementById('customSeal');
  const fromInput = document.getElementById('letterFrom');
  const toInput = document.getElementById('letterTo');
  const contentInput = document.getElementById('letterContent');
  const dateInput = document.getElementById('letterDate');

  // 默认日期
  const today = new Date().toISOString().slice(0, 10);
  if (dateInput) dateInput.value = today;

  sealBtn?.addEventListener('click', () => {
    if (!contentInput.value.trim()) {
      alert('请先写下你想说的话哦~');
      return;
    }
    const name = fromInput.value.trim() || '匿';
    const firstChar = name.charAt(0);
    customSeal.textContent = firstChar || '?';
    stampPreview.style.display = 'block';
    sealBtn.textContent = '✓ 已封缄';
    sealBtn.disabled = true;
    sealBtn.style.opacity = '0.6';
    paper.classList.add('folded');
    setTimeout(() => paper.classList.remove('folded'), 800);
    downloadBtn.style.display = 'inline-block';
  });

  downloadBtn?.addEventListener('click', async () => {
    try {
      const canvas = await html2canvas(paper, {
        backgroundColor: '#F5F0E8',
        scale: 2,
        useCORS: true
      });
      const link = document.createElement('a');
      link.download = `我的家书_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch(e) {
      alert('截图失败：' + e.message);
    }
  });

  resetBtn?.addEventListener('click', () => {
    contentInput.value = '';
    stampPreview.style.display = 'none';
    sealBtn.textContent = '🔒 封缄';
    sealBtn.disabled = false;
    sealBtn.style.opacity = '1';
    downloadBtn.style.display = 'none';
  });
}

/* ================================================
   移动端增强 JS 补丁
   ================================================ */
(function(){
  'use strict';

  // --- 1. 触摸设备检测 ---
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  document.documentElement.classList.add(isTouch ? 'touch' : 'mouse');

  // --- 2. 角色翻转卡：触屏下改为点击切换（关闭 hover 依赖）---
  if (isTouch) {
    document.addEventListener('click', function(e) {
      var card = e.target.closest('.flip-card');
      if (card) {
        document.querySelectorAll('.flip-card.tapped')
          .forEach(function(c){ if(c !== card) c.classList.remove('tapped'); });
        card.classList.toggle('tapped');
      }
    });
  }

  // --- 3. Web Share API ---
  var shareBtn = document.getElementById('shareBtn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async function() {
      var shareData = {
        title: '尺素传情 · 侨批记忆',
        text: '跨越山海的平安家书——沉浸式体验世界记忆遗产侨批文化',
        url: location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(location.href);
          showMobileToast('链接已复制，快分享给朋友吧');
        } else {
          prompt('请复制以下链接分享：', location.href);
        }
      } catch(e) {
        if (e && e.name !== 'AbortError') console.warn('share error', e);
      }
    });
  }

  // --- 4. 轻提示 Toast ---
  function showMobileToast(msg) {
    var toast = document.createElement('div');
    toast.textContent = msg;
    toast.style.cssText = [
      'position:fixed', 'top:50%', 'left:50%',
      'transform:translate(-50%,-50%)',
      'background:rgba(44,44,44,0.9)', 'color:#F5F0E8',
      'padding:.8rem 1.5rem', 'border-radius:8px',
      'font-family:Noto Serif SC,serif', 'z-index:3000',
      'font-size:.9rem', 'pointer-events:none',
      'animation:toastIn .3s ease-out'
    ].join(';');
    document.body.appendChild(toast);
    setTimeout(function(){ toast.style.opacity = '0'; toast.style.transition = 'opacity .4s'; }, 1500);
    setTimeout(function(){ toast.remove(); }, 2200);
  }
  // toast keyframes (若不存在则注入)
  if (!document.getElementById('__toast_style')) {
    var s = document.createElement('style');
    s.id = '__toast_style';
    s.textContent = '@keyframes toastIn{from{opacity:0;transform:translate(-50%,-40%)}to{opacity:1;transform:translate(-50%,-50%)}}';
    document.head.appendChild(s);
  }

  // --- 5. 档案柜横滑 scroll-snap ---
  var drawerTabs = document.getElementById('drawerTabs');
  if (drawerTabs) {
    drawerTabs.style.scrollSnapType = 'x mandatory';
    drawerTabs.querySelectorAll('.drawer-tab').forEach(function(t){
      t.style.scrollSnapAlign = 'start';
    });
  }

  // --- 6. 阻止 iOS 橡皮筋回弹（弹窗打开时）---
  var _preventTouchMove = false;
  document.addEventListener('touchmove', function(e){
    var inModal = e.target.closest('.game-modal.open, .story-modal.open');
    if (!inModal && document.body.style.overflow === 'hidden') {
      // body overflow hidden 是脚本中打开 modal 时设置的
      // 不阻止，因为当前实现中 modal 会设 body overflow hidden
    }
  }, {passive: true});

  // --- 7. 横屏提示（手机）---
  var orientHint = document.createElement('div');
  orientHint.style.cssText = [
    'position:fixed', 'inset:0',
    'background:rgba(44,44,44,0.95)', 'color:#F5F0E8',
    'z-index:99999', 'display:none',
    'align-items:center', 'justify-content:center',
    'flex-direction:column', 'text-align:center',
    'padding:2rem', 'font-family:Noto Serif SC,serif'
  ].join(';');
  orientHint.innerHTML = '<div style="font-size:3rem;margin-bottom:1rem;">📱</div><p style="font-size:1rem;line-height:2;">建议竖屏浏览<br>体验更佳</p><div style="margin-top:2rem;font-size:.85rem;opacity:.6;">（点击任意处关闭）</div>';
  document.body.appendChild(orientHint);

  function checkOrientation() {
    if (window.innerWidth > window.innerHeight && window.innerWidth < 900) {
      orientHint.style.display = 'flex';
    } else {
      orientHint.style.display = 'none';
    }
  }
  window.addEventListener('orientationchange', checkOrientation);
  window.addEventListener('resize', checkOrientation);
  checkOrientation();
  orientHint.addEventListener('click', function(){ orientHint.style.display = 'none'; });

  // --- 8. 弹窗打开时锁定 body（已有 overflow hidden，补充 iOS bug 修复）---
  var _modalScroller = null;
  document.querySelectorAll('.game-modal, .story-modal').forEach(function(el){
    el.addEventListener('touchmove', function(e){ e.preventDefault(); }, {passive: false});
  });

})();
