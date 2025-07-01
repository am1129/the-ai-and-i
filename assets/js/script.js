// ぼやけた円のランダム移動アニメーション（GSAP版）
const balls = Array.from(document.querySelectorAll('.js-bg-ball'));

// 初期位置・サイズをランダムに設定
balls.forEach(ball => {
  const x = Math.random() * 60;
  const y = Math.random() * 60;
  const s = 24 + Math.random() * 16; // 24vw〜40vw
  ball.style.left = x + 'vw';
  ball.style.top = y + 'vh';
  ball.style.width = s + 'vw';
  ball.style.height = s + 'vw';
});

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

balls.forEach(ball => moveBall(ball));

// グラデーション角度アニメーション
const bgGradient = document.querySelector('.js-bg-gradient');
if (bgGradient) {
  // CSS変数で角度を管理
  bgGradient.style.setProperty('--gradient-angle', '120deg');
  gsap.to(bgGradient, {
    '--gradient-angle': '480deg', // 120→480deg（1周）
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

// タイプライター風アニメーション
function typewriterText(element, text, onComplete) {
  let i = 0;
  function showNext() {
    if (i <= text.length) {
      element.textContent = text.slice(0, i) + '_';
      i++;
      setTimeout(showNext, 100); // 1文字40ms
    } else {
      element.textContent = text; // _を消す
      if (onComplete) onComplete();
    }
  }
  showNext();
}

window.addEventListener('DOMContentLoaded', () => {
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

  // 日本語・英語を同時にタイプライター表示
  typewriterText(aiJa, aiJaText, onTypewriterFinished);
  typewriterText(aiEn, aiEnText, onTypewriterFinished);

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
});
