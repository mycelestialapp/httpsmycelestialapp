<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>符文仪式 - 极光大师版</title>
  <style>
    body {
      margin: 0;
      height: 100vh;
      background: #0a0d1f;
      color: #e8d9a6;
      font-family: Georgia, serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    canvas#bg {
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: -1;
    }

    h1 {
      margin: 30px 0 10px;
      font-size: 3em;
      color: #d4af37;
      text-shadow: 0 0 25px #d4af37;
      z-index: 10;
    }

    #controls {
      display: flex;
      gap: 20px;
      margin: 20px;
      z-index: 10;
    }

    button {
      padding: 14px 30px;
      background: rgba(40, 20, 80, 0.7);
      border: 2px solid #d4af37;
      color: #d4af37;
      border-radius: 12px;
      cursor: pointer;
      font-size: 1.2em;
      transition: all 0.4s;
      box-shadow: 0 0 15px rgba(212,175,55,0.3);
    }

    button:hover {
      transform: scale(1.08);
      box-shadow: 0 0 30px #d4af37;
      background: rgba(60, 30, 100, 0.9);
    }

    #runes {
      display: flex;
      gap: 40px;
      margin: 50px 20px;
      perspective: 1400px;
      z-index: 10;
    }

    .rune-card {
      width: 180px;
      height: 260px;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 1.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      cursor: pointer;
    }

    .rune-card.flipped { transform: rotateY(180deg) scale(1.05); }

    .face {
      position: absolute;
      width: 100%; height: 100%;
      backface-visibility: hidden;
      border-radius: 18px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 6em;
      color: #ffd700;
      background: linear-gradient(rgba(10,8,30,0.75), rgba(40,20,80,0.75));
      box-shadow: 0 0 40px rgba(212,175,55,0.5), inset 0 0 30px rgba(212,175,55,0.3);
      transition: box-shadow 0.6s;
    }

    .rune-card:hover .face { box-shadow: 0 0 60px #ffd700, inset 0 0 40px #ffd700; }

    .back {
      transform: rotateY(180deg);
      background: rgba(10,8,30,0.9);
      font-size: 1.1em;
      padding: 20px;
      text-align: center;
    }

    #reading {
      max-width: 1000px;
      margin: 40px 20px;
      padding: 30px;
      background: rgba(10,8,30,0.8);
      border-radius: 18px;
      border: 1px solid #d4af37;
      backdrop-filter: blur(12px);
      box-shadow: 0 0 50px rgba(0,0,0,0.8);
      z-index: 10;
    }

    .section h2 {
      color: #ffd700;
      margin-bottom: 15px;
      font-size: 1.6em;
      border-bottom: 1px solid rgba(255,215,0,0.4);
      padding-bottom: 10px;
    }

    audio { display: none; }
  </style>
</head>
<body>
  <canvas id="bg"></canvas>

  <h1>符文仪式 · 极光降临</h1>

  <div id="controls">
    <button onclick="drawRunes(1)">单符指引</button>
    <button onclick="drawRunes(3)">三符命运</button>
    <button onclick="drawRunes(5)">五符十字</button>
  </div>

  <div id="runes"></div>

  <div id="reading"></div>

  <script>
    const runes = [
      { sym: 'ᚠ', name: '费胡', upright: '财富涌入、丰盛起点', rev: '资源流失、贪婪警示' },
      { sym: 'ᚢ', name: '乌鲁兹', upright: '原始力量、身体恢复', rev: '精力枯竭、意外受伤' },
      { sym: 'ᚦ', name: '苏里斯兹', upright: '防护屏障、突破荆棘', rev: '外部威胁、内在冲突' },
      { sym: 'ᚨ', name: '安苏兹', upright: '神圣启示、清晰沟通', rev: '误导信息、言语失误' },
      { sym: 'ᛟ', name: '奥萨拉', upright: '祖产繁荣、精神家园', rev: '遗产贫穷、家族奴役' }
      // 你可以继续添加剩余符文
    ];

    function randomRune() {
      const r = runes[Math.floor(Math.random() * runes.length)];
      return { ...r, reversed: Math.random() < 0.35 };
    }

    function drawRunes(count) {
      const area = document.getElementById('runes');
      area.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const rune = randomRune();
        const card = document.createElement('div');
        card.className = 'rune-card';
        card.innerHTML = `
          <div class="face front">${rune.sym}</div>
          <div class="face back">
            <h3>${rune.name}</h3>
            <p>${rune.reversed ? '逆位：' + rune.rev : '正位：' + rune.upright}</p>
          </div>
        `;
        setTimeout(() => {
          card.classList.add('flipped');
          playChime();
        }, 600 + i * 500);
        area.appendChild(card);
      }
      setTimeout(showMasterReading, count * 600);
      auroraFlow();
    }

    function showMasterReading() {
      const reading = document.getElementById('reading');
      const themes = Array.from(document.querySelectorAll('.rune-card .back h3')).map(h => h.textContent).join(' → ');
      reading.innerHTML = `
        <div class="section">
          <h2>【全景镜像】</h2>
          <p>北欧诸神在极光中注视你，能量如流动的星河。核心主题：${themes} —— 稳定守护与内在流动的交织，土元素强势，水之灵动稍弱。</p>
        </div>
        <div class="section">
          <h2>【阴影瓶颈】</h2>
          <p>土旺压制水，易生情绪滞重、决策僵化，或生活缺乏变通。小心肾/膀胱/情感阻塞的隐忧。</p>
        </div>
        <div class="section">
          <h2>【动力链条】</h2>
          <p>土生金，金生水——需主动唤醒水元素，方能化解土之固执，迎来流动新生。</p>
        </div>
        <div class="section">
          <h2>【转化锚点】</h2>
          <ul>
            <li>心理：闭眼倾听体内哪处“干渴”或“堵塞”，那是水元素的呼唤。</li>
            <li>行动：今晚泡一杯温水，默念“流动与滋养”，或听雨声/海浪10分钟。</li>
            <li>掌控：握住属于你的镰刀——设定“不再无限等待”的边界，让能量自由流动。</li>
          </ul>
        </div>
      `;
      playAmbient();
    }

    function playChime() {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.frequency.value = 520;
      osc.frequency.setValueAtTime(780, audioCtx.currentTime + 0.08);
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }

    function playAmbient() {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 220;
      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    }

    function auroraFlow() {
      const canvas = document.getElementById('bg');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext('2d');

      let time = 0;
      function animate() {
        ctx.fillStyle = 'rgba(10,13,31,0.08)';
        ctx.fillRect(0,0,canvas.width,canvas.height);

        time += 0.005;
        for (let i = 0; i < 8; i++) {
          const hue = 180 + Math.sin(time + i) * 60;
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.1)`);
          gradient.addColorStop(0.5, `hsla(${hue + 30}, 90%, 60%, 0.25)`);
          gradient.addColorStop(1, `hsla(${hue}, 80%, 50%, 0.1)`);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, canvas.height * 0.2 + Math.sin(time + i*2) * 100, canvas.width, 300);
        }

        requestAnimationFrame(animate);
      }
      animate();
    }

    window.onresize = () => {
      const canvas = document.getElementById('bg');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    auroraFlow();
  </script>
</body>
</html>