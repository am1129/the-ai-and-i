// =========================
// 初期化・関数呼び出し
// =========================

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundBalls();
  animateBackgroundGradient();
  startTypewriterEffect();
  // ここにAPI呼び出しやイベントリスナーの初期化を追加していく
});

// =========================
// 関数定義
// =========================

// 背景のぼやけた円の初期化とアニメーション
function initBackgroundBalls() {
  const balls = Array.from(document.querySelectorAll('.js-bg-ball'));
  balls.forEach(ball => {
    const x = Math.random() * 60;
    const y = Math.random() * 60;
    const s = 24 + Math.random() * 16; // 24vw〜40vw
    ball.style.left = x + 'vw';
    ball.style.top = y + 'vh';
    ball.style.width = s + 'vw';
    ball.style.height = s + 'vw';
  });
  balls.forEach(ball => moveBall(ball));
}

function moveBall(ball) {
  const x = Math.random() * 60;
  const y = Math.random() * 60;
  const s = 24 + Math.random() * 16; // 24vw〜40vw
  const duration = 6 + Math.random() * 6; // 6〜12秒で移動・変化
  gsap.to(ball, {
    left: x + 'vw',
    top: y + 'vh',
    width: s + 'vw',
    height: s + 'vw',
    duration: duration,
    ease: 'power1.inOut',
    onComplete: () => moveBall(ball)
  });
}

// グラデーション背景アニメーション
function animateBackgroundGradient() {
  const bgGradient = document.querySelector('.js-bg-gradient');
  if (!bgGradient) return;
  bgGradient.style.setProperty('--gradient-angle', '120deg');
  gsap.to(bgGradient, {
    '--gradient-angle': '480deg',
    duration: 60,
    repeat: -1,
    ease: 'linear',
    modifiers: {
      '--gradient-angle': angle => `${parseFloat(angle) % 360}deg`
    },
    onUpdate: function() {
      const angle = getComputedStyle(bgGradient).getPropertyValue('--gradient-angle');
      bgGradient.style.background = `linear-gradient(${angle}, #FBF9E2 0%, #E9A6A0 25%, #ADE7F5 50%, #A2C0F4 75%, #B390D0 100%)`;
    }
  });
}

// タイプライター演出と選択肢表示
function startTypewriterEffect() {
  const aiJa = document.querySelector('.c-ai-ja');
  const aiEn = document.querySelector('.c-ai-en');
  const aiJaText = aiJa ? aiJa.textContent : '';
  const aiEnText = aiEn ? aiEn.textContent : '';
  if (aiJa) aiJa.textContent = '';
  if (aiEn) aiEn.textContent = '';

  let finishedCount = 0;
  function onTypewriterFinished() {
    finishedCount++;
    if (finishedCount === 2) showChoices();
  }

  typewriterText(aiJa, aiJaText, 100, onTypewriterFinished);
  typewriterText(aiEn, aiEnText, 80, onTypewriterFinished);
}

function typewriterText(element, text, duration, onComplete) {
  if (!element) return;
  let i = 0;
  function showNext() {
    if (i <= text.length) {
      element.textContent = text.slice(0, i) + '_';
      i++;
      setTimeout(showNext, duration);
    } else {
      element.textContent = text;
      if (onComplete) onComplete();
    }
  }
  showNext();
}

function showChoices() {
  const choices = document.querySelectorAll('.c-choice');
  choices.forEach((choice, idx) => {
    gsap.to(choice, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 1,
      delay: 0.2 * idx,
      onStart: () => choice.classList.add('is-visible')
    });
  });
}

// =========================
// 今後のAPI呼び出しや履歴管理用の変数
// =========================

const history = [
  { role: 'system', content: 'あなたは詩的でやさしいAIです。' },
  { role: 'user', content: '最初のプロンプト' },
  { role: 'assistant', content: '最初の返答' },
  { role: 'user', content: '次の選択肢をクリックしたときのプロンプト' },
];