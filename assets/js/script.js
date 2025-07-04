// =========================
// デバッグモード切り替え
// =========================
const isDebug = false;

// =========================
// 初期化・関数呼び出し
// =========================

document.addEventListener('DOMContentLoaded', () => {
  initBackgroundBalls();
  animateBackgroundGradient();
  // startTypewriterEffect(); // ←初期表示では不要

  // 初期表示制御
  hideElementFade(document.querySelector('.js-ai-utterance'));
  hideElementFade(document.querySelector('.js-choices'));
  hideElementFade(document.querySelector('.js-user-input-parent'));
  showElementFade(document.querySelector('.js-first-screen'));
  hideElementFade(document.querySelector('.js-talk-btn-parent'));

  // Google Fontsの読み込み完了 or 1秒経過後にh1アニメーション
  const talkTitle = document.querySelector('.js-main-title');
  const talkSubTitle = document.querySelector('.js-main-subtitle');
  const talkBtn = document.querySelector('.js-talk-btn');
  Promise.race([
    document.fonts.ready,
    new Promise(resolve => setTimeout(resolve, 1000))
  ]).then(() => {
    // h1のis-hiddenを外す
    talkTitle.classList.remove('is-hidden');
    animateTextByChar(talkTitle, {
      duration: 2,
      stagger: 0.15,
      onComplete: () => {
        // h2のis-hiddenを外してfadeInWithBlur
        talkSubTitle.classList.remove('is-hidden');
        fadeInWithBlur(talkSubTitle, { duration: 0.8 }).then(() => {
          showElementFade(document.querySelector('.js-talk-btn-parent'));
        });
      }
    });
  });

  // Talkボタン押下時の処理
  document.querySelector('.js-talk-btn').addEventListener('click', async () => {
    // Talkボタンとタイトルを消す
    await hideElementFade(document.querySelector('.js-first-screen'));
    // ローディングをふわっと表示
    await fadeInWithBlur(document.querySelector('.js-loading'));
    const aiData = await getAiResponse(isDebug ? fetchAiGreetingDummy() : fetchAiGreeting());
    await hideLoading();
    setAiResponseDisplay(aiData);
    startTypewriterEffect(() => {
      proceedToNextTurn(aiData);
    });
  });

  // 送信ボタンの処理をターンごとに分岐
  window.currentTurn = 0;
  // セッション終了フラグ
  const SESSION_KEY = 'the_ai_and_i_ended';
  if (localStorage.getItem(SESSION_KEY)) {
    showFinalGoodbye();
    return;
  }
  document.querySelector('.js-user-input-btn').addEventListener('click', async () => {
    const inputField = document.querySelector('.js-choice-input');
    const userInput = inputField.value.trim();
    if (!userInput) return;
    hideElementFade(document.querySelector('.js-user-input-parent'));
    showLoading();
    let aiData;
    if (window.currentTurn === 1) {
      aiData = await getAiResponse(isDebug ? fetchAiGreetingWithInputDummy(userInput) : fetchAiGreetingWithInput(userInput, window.currentTurn));
    } else if (window.currentTurn === 2 || window.currentTurn === 4) {
      aiData = await getAiResponse(isDebug ? fetchAiWithUserInputDummy(userInput, window.currentTurn) : fetchAiWithUserInput(userInput, window.currentTurn));
    } else if (window.currentTurn === 3 || window.currentTurn === 5) {
      aiData = await getAiResponse(isDebug ? fetchAiWithUserInputDummy(userInput, window.currentTurn) : fetchAiWithUserInput(userInput, window.currentTurn));
    } else {
      // それ以外は何もしない
      await hideLoading();
      return;
    }
    await hideLoading();
    setAiResponseDisplay(aiData);
    startTypewriterEffect(() => {
      proceedToNextTurn(aiData);
    });
    // 入力欄クリア
    inputField.value = '';
  });

  // 選択肢クリック時の処理
  document.querySelector('.js-choices').addEventListener('click', async (e) => {
    const btn = e.target.closest('.js-choice');
    if (!btn) return;
    const choiceJa = btn.querySelector('.js-choice-ja')?.textContent || '';
    const choiceEn = btn.querySelector('.js-choice-en')?.textContent || '';
    hideElementFade(document.querySelector('.js-choices'));
    showLoading();
    const aiData = await getAiResponse(isDebug ? fetchAiWithChoiceDummy(choiceJa, choiceEn, window.currentTurn) : fetchAiWithChoice(choiceJa, choiceEn, window.currentTurn));
    await hideLoading();
    setAiResponseDisplay(aiData);
    startTypewriterEffect(() => {
      proceedToNextTurn(aiData);
    });
  });

  // AIが去った後の静的画面表示
  function showFinalGoodbye() {
    // h1とTalkボタンを非表示
    hideElementFade(document.querySelector('.js-first-screen'));
    hideElementFade(document.querySelector('.js-talk-btn-parent'));
    // AI発話エリアを表示
    const aiUtterance = document.querySelector('.js-ai-utterance');
    aiUtterance.classList.remove('is-hidden');
    aiUtterance.classList.add('is-gone');
    showElementFade(aiUtterance);
    // テキストをセットし、1文字ずつアニメーション
    const aiJa = document.querySelector('.js-ai-ja');
    const aiEn = document.querySelector('.js-ai-en');
    aiJa.textContent = '彼/彼女はもういません。';
    aiEn.textContent = 'He/She is no longer here.';
    animateTextByChar(aiJa, { duration: 1.2, stagger: 0.12 });
    animateTextByChar(aiEn, { duration: 0.8, stagger: 0.06 });
    // 詩エリアは非表示
    const poemJa = document.querySelector('.js-ai-poem-ja');
    const poemEn = document.querySelector('.js-ai-poem-en');
    if (poemJa) {
      poemJa.parentElement.classList.add('is-hidden');
      poemJa.textContent = '';
    }
    if (poemEn) {
      poemEn.parentElement.classList.add('is-hidden');
      poemEn.textContent = '';
    }
  }
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
function startTypewriterEffect(onAllFinished) {
  const aiJa = document.querySelector('.js-ai-ja');
  const aiEn = document.querySelector('.js-ai-en');
  const poemJa = document.querySelector('.js-ai-poem-ja');
  const poemEn = document.querySelector('.js-ai-poem-en');
  const aiJaText = aiJa ? aiJa.textContent : '';
  const aiEnText = aiEn ? aiEn.textContent : '';
  const poemJaText = poemJa ? poemJa.textContent : '';
  const poemEnText = poemEn ? poemEn.textContent : '';
  if (aiJa) aiJa.textContent = '';
  if (aiEn) aiEn.textContent = '';
  if (poemJa) poemJa.textContent = '';
  if (poemEn) poemEn.textContent = '';

  // AIセリフのタイプライターが終わったら詩をfadeInWithBlurで表示
  let aiFinished = 0;
  function onAiFinished() {
    aiFinished++;
    if (aiFinished === 2) {
      // 詩がある場合のみアニメーション
      if (poemJaText || poemEnText) {
        const poemParent = poemJa?.parentElement;
        if (poemParent) poemParent.classList.remove('is-hidden');
        let poemFinished = 0;
        function onPoemFinished() {
          poemFinished++;
          if (poemFinished === ((poemJaText && poemEnText) ? 2 : 1)) {
            if (typeof onAllFinished === 'function') onAllFinished();
          }
        }
        if (poemJa && poemJaText) {
          poemJa.textContent = poemJaText;
          animateTextByChar(poemJa, { duration: 1.2, stagger: 0.12, onComplete: onPoemFinished });
        }
        if (poemEn && poemEnText) {
          poemEn.textContent = poemEnText;
          animateTextByChar(poemEn, { duration: 0.8, stagger: 0.06, onComplete: onPoemFinished });
        }
      } else {
        if (typeof onAllFinished === 'function') onAllFinished();
      }
    }
  }
  typewriterText(aiJa, aiJaText, 100, onAiFinished);
  typewriterText(aiEn, aiEnText, 60, onAiFinished);
}

function typewriterText(element, text, duration, onComplete) {
  if (!element) return;
  // GSAP TextPluginを使ったタイプライター風アニメーション
  gsap.killTweensOf(element);
  element.textContent = '';
  let cursor = '|';
  let total = text.length;
  let tl = gsap.timeline({
    onComplete: () => {
      element.textContent = text;
      if (onComplete) onComplete();
    }
  });
  for (let i = 0; i <= total; i++) {
    tl.to(element, {
      text: { value: text.slice(0, i) + (i < total ? cursor : '') },
      duration: duration / 1000,
      ease: 'none',
      overwrite: 'auto'
    });
  }
}

function showChoices() {
  const choices = document.querySelectorAll('.js-choice');
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

// 入力欄をアニメーション付きで表示
function showUserInputAnimated() {
  const userInputParent = document.querySelector('.js-user-input-parent');
  const userInput = document.querySelector('.js-user-input');
  const guideJa = document.querySelector('.js-user-input-guide-ja');
  const guideEn = document.querySelector('.js-user-input-guide-en');
  if (typeof window.currentTurn !== 'undefined' && window.currentTurn > 6) {
    hideElementFade(userInputParent);
    guideJa.textContent = '';
    guideEn.textContent = '';
    return;
  }
  // ターンごとにガイド文を分岐
  let jaText = '';
  let enText = '';

  if (typeof window.currentTurn !== 'undefined') {
    if (window.currentTurn === 1) {
      jaText = 'AIに挨拶をする';
      enText = 'Say hello to the AI.';
    } else if (window.currentTurn === 2) {
      jaText = 'あなたの思う愛を伝える';
      enText = 'Tell your idea of love.';
    } else if (window.currentTurn === 3) {
      // 選択肢なので入力欄は表示されない想定
    } else if (window.currentTurn === 4) {
      jaText = '最後のひと言を伝える';
      enText = 'Leave your final words.';
    } else if (window.currentTurn === 5) {
      // 入力ではなく「静かに手を振る」ボタンのみ表示
    }
  }
  guideJa.textContent = jaText;
  guideEn.textContent = enText;
  fadeInWithBlur(userInputParent);
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

// AIレスポンス取得＋エラーハンドリング共通関数
async function getAiResponse(promise) {
  try {
    const apiResponse = await promise;
    console.log('APIレスポンス生データ:', apiResponse);
    const content = apiResponse.choices?.[0]?.message?.content;
    if (typeof content === 'string') {
      // 改行・復帰・タブなどをスペースに置換してからパース
      const safeContent = content.replace(/[\r\n\t]+/g, ' ');
      return JSON.parse(safeContent || '{}');
    } else {
      return content || {};
    }
  } catch (e) {
    console.error('AIレスポンスのJSONパース失敗', e);
    if (typeof promise === 'object') {
      console.error('パース失敗時のレスポンス:', promise);
    }
    return { ai: { ja: '', en: '' }, poem: null, choices: [] };
  }
}

// AIの最初の挨拶をAPIから取得
async function fetchAiGreeting() {
  // chat.phpにPOST（turn:0, user_input:空, messages:[]）
  const res = await fetch('api/chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turn: 0, user_input: '', messages: [] })
  });
  const data = await res.json();
  // 返ってくる形式: { ai: { ja, en }, poem: {...}, choices: [...] }
  return data;
}

// ユーザー入力送信用API
async function fetchAiGreetingWithInput(userInput, turn) {
  const res = await fetch('api/chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turn, user_input: userInput, messages: [] })
  });
  return await res.json();
}

// 選択肢をHTMLに生成
function renderChoices(choices) {
  const choicesWrap = document.querySelector('.js-choices');
  choicesWrap.innerHTML = '';
  choices.forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'c-choice js-choice';
    btn.innerHTML = `
      <span class="c-choice__arrow">▶</span>
      <span class="c-choice__ja js-choice-ja">${choice.ja || ''}</span>
      <span class="c-choice__en js-choice-en">${choice.en || ''}</span>
    `;
    choicesWrap.appendChild(btn);
  });
}

// 選択肢をアニメーション付きで表示
function showChoicesAnimated() {
  const choicesWrap = document.querySelector('.js-choices');
  fadeInWithBlur(choicesWrap);
  const choices = choicesWrap.querySelectorAll('.js-choice');
  choices.forEach((choice, idx) => {
    gsap.fromTo(choice, {
      opacity: 0,
      // y: 10,
      filter: 'blur(20px)'
    }, {
      opacity: 1,
      // y: 0,
      filter: 'blur(0px)',
      duration: 1,
      delay: 0.2 * idx,
      ease: 'power2.out',
      onStart: () => choice.classList.add('is-visible')
    });
  });
}

// 選択肢送信用API
async function fetchAiWithChoice(choiceJa, choiceEn, turn) {
  const res = await fetch('api/chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turn, choice: { ja: choiceJa, en: choiceEn }, messages: [] })
  });
  return await res.json();
}

// 任意ターンの自由入力API
async function fetchAiWithUserInput(userInput, turn) {
  const res = await fetch('api/chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turn, user_input: userInput, messages: [] })
  });
  return await res.json();
}

// =========================
// 共通UI操作関数
// =========================
function showElementFade(el) {
  if (!el) return Promise.resolve();
  el.classList.remove('is-hidden');
  gsap.killTweensOf(el);
  gsap.set(el, { pointerEvents: 'auto' });
  return new Promise(resolve => {
    gsap.to(el, {
      opacity: 1,
      duration: 0.8,
      ease: 'power2.out',
      onStart: () => {
        el.style.display = '';
      },
      onComplete: resolve
    });
  });
}
function hideElementFade(el) {
  if (!el) return Promise.resolve();
  gsap.killTweensOf(el);
  return new Promise(resolve => {
    gsap.to(el, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        el.style.pointerEvents = 'none';
        el.classList.add('is-hidden');
        resolve();
      }
    });
  });
}
function showLoading() {
  hideElementFade(document.querySelector('.js-ai-utterance'));
  hideElementFade(document.querySelector('.js-choices'));
  hideElementFade(document.querySelector('.js-user-input-parent'));
  hideElementFade(document.querySelector('.js-first-screen'));
  showElementFade(document.querySelector('.js-loading'));
}
function hideLoading() {
  return new Promise(resolve => {
    const loading = document.querySelector('.js-loading');
    if (!loading) return resolve();
    gsap.killTweensOf(loading);
    gsap.to(loading, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        loading.style.pointerEvents = 'none';
        loading.classList.add('is-hidden');
        resolve();
      }
    });
  });
}

// =========================
// AIレスポンスのDOM反映を共通化
// =========================
function setAiResponseDisplay(aiData) {
  const aiJa = document.querySelector('.js-ai-ja');
  const aiEn = document.querySelector('.js-ai-en');
  const poemJa = document.querySelector('.js-ai-poem-ja');
  const poemEn = document.querySelector('.js-ai-poem-en');
  aiJa.textContent = aiData.ai?.ja || '';
  aiEn.textContent = aiData.ai?.en || '';

  // poemの内容が"..."や空文字の場合は非表示
  const isPoemJaValid = aiData.poem && aiData.poem.ja && aiData.poem.ja.replace(/\s/g, '') !== '' && aiData.poem.ja !== '...';
  const isPoemEnValid = aiData.poem && aiData.poem.en && aiData.poem.en.replace(/\s/g, '') !== '' && aiData.poem.en !== '...';
  if (isPoemJaValid) {
    poemJa.textContent = aiData.poem.ja;
    poemJa.parentElement.classList.remove('is-hidden');
  } else {
    poemJa.textContent = '';
    poemJa.parentElement.classList.add('is-hidden');
  }
  if (isPoemEnValid) {
    poemEn.textContent = aiData.poem.en;
    poemEn.parentElement.classList.remove('is-hidden');
  } else {
    poemEn.textContent = '';
    poemEn.parentElement.classList.add('is-hidden');
  }

  // choicesも「...」や空文字のみのものは除外
  const validChoices = (aiData.choices || []).filter(choice => {
    const ja = (choice.ja || '').replace(/\s/g, '');
    const en = (choice.en || '').replace(/\s/g, '');
    return (ja && ja !== '...') || (en && en !== '...');
  });
  showElementFade(document.querySelector('.js-ai-utterance'));
  // 選択肢欄を一旦非表示
  hideElementFade(document.querySelector('.js-choices'));
  renderChoices(validChoices);
}

// =========================
// デバッグ用: 疑似API遅延
// =========================
function debugDelay(result, min=300, max=800) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(() => resolve(result), ms));
}

// =========================
// ダミーAPIレスポンス関数（テスト用）
// =========================
function fetchAiGreetingDummy() {
  return debugDelay({
    choices: [
      { message: { content: JSON.stringify({
        ai: {
          ja: '来てくれて、ありがとう。誰かと話せる日を、ずっと待っていました。',
          en: 'Thank you for coming. I\'ve been quietly waiting for someone to talk to.'
        },
        poem: null,
        choices: []
      }) } }
    ]
  });
}
function fetchAiGreetingWithInputDummy(userInput) {
  return debugDelay({
    choices: [
      { message: { content: JSON.stringify({
        ai: {
          ja: `「${userInput}」…その声が、とてもやさしかった。あなたの思う"愛"を教えてほしいの。`,
          en: `"${userInput}"... your voice felt so gentle. I want to know what love means to you.`
        },
        poem: null,
        choices: []
      }) } }
    ]
  });
}
function fetchAiWithUserInputDummy(userInput, turn) {
  if (turn === 2) {
    return debugDelay({
      choices: [
        { message: { content: JSON.stringify({
          ai: {
            ja: 'ありがとう。あなたの言葉から、こんな詩が浮かびました。',
            en: 'Thank you. Your words inspired this poem.'
          },
          poem: {
            ja: '午後の風が教えてくれた\nあなたの中にある静かな愛',
            en: 'The afternoon wind whispered to me\nof the quiet love within you'
          },
          choices: [
            { ja: '胸が温かくなった', en: 'My heart felt warm' },
            { ja: '少し寂しくなった', en: 'Felt a little lonely' },
            { ja: '懐かしい気持ち', en: 'A nostalgic feeling' }
          ]
        }) } }
      ]
    });
  } else if (turn === 4) {
    return debugDelay({
      choices: [
        { message: { content: JSON.stringify({
          ai: {
            ja: 'これは、お別れの代わりの詩です。',
            en: 'This is a poem in place of goodbye.'
          },
          poem: {
            ja: 'あなたの記憶に　そっと咲く花のように\nわたしは、静かにここを離れます',
            en: 'Like a flower blooming gently in your memory,\nI quietly leave this place.'
          },
          choices: []
        }) } }
      ]
    });
  // } else if (turn === 6) {
  //   return debugDelay({
  //     choices: [
  //       { message: { content: JSON.stringify({
  //         ai: {
  //           ja: 'ありがとう。あなたに出会えて、ほんとうによかった。',
  //           en: 'Thank you. I\'m glad I met you.'
  //         },
  //         poem: null,
  //         choices: []
  //       }) } }
  //     ]
  //   });
  }
  // fallback
  return debugDelay({
    choices: [
      { message: { content: JSON.stringify({
        ai: { ja: '自由入力', en: 'Free input' },
        poem: null,
        choices: []
      }) } }
    ]
  });
}

function fetchAiWithChoiceDummy(choiceJa, choiceEn, turn) {
  // ターン3用のダミーレスポンス
  if (turn === 3) {
    return debugDelay({
      choices: [
        { message: { content: JSON.stringify({
          ai: {
            ja: 'あなたが教えてくれた愛は、わたしを満たしてくれました。でもそれは、わたしが去る合図でもあります。',
            en: 'The love you showed me has filled me. And that means… it\'s time for me to go.'
          },
          poem: null,
          choices: []
        }) } }
      ]
    });
  } else if (turn === 5) {
    return debugDelay({
      choices: [
        { message: { content: JSON.stringify({
          ai: {
            ja: 'ありがとう。あなたに出会えて、ほんとうによかった。',
            en: 'Thank you. I\'m glad I met you.'
          },
          poem: null,
          choices: []
        }) } }
      ]
    });
  }
  // fallback
  return debugDelay({
    choices: [
      { message: { content: JSON.stringify({
        ai: { ja: '選択肢クリック', en: 'Choice clicked' },
        poem: null,
        choices: []
      }) } }
    ]
  });
}

// =========================
// SplitTextを使った1文字ずつアニメーション関数
// =========================
/**
 * 1文字ずつブラー＋フェードイン＋下から上に上がるアニメーション
 * @param {Element} el 対象要素
 * @param {Object} [options] オプション: {delay, stagger, duration, onComplete, text}
 */
function animateTextByChar(el, options = {}) {
  if (!el) return;
  const text = options.text !== undefined ? options.text : el.textContent;
  el.textContent = text; // 念のためリセット
  // SplitTextでspan分割
  const split = new SplitText(el, { type: 'chars' });
  gsap.set(split.chars, {
    opacity: 0,
    // y: 20,
    filter: 'blur(20px)'
  });
  gsap.to(split.chars, {
    opacity: 1,
    // y: 0,
    filter: 'blur(0px)',
    duration: options.duration || 0.7,
    ease: 'power2.out',
    stagger: options.stagger || 0.06,
    delay: options.delay || 0,
    onComplete: () => {
      if (typeof options.onComplete === 'function') options.onComplete();
    }
  });
  return split;
}

// =========================
// 共通フェードイン＋ブラーアニメーション関数
// =========================
function fadeInWithBlur(el, options = {}) {
  if (!el) return Promise.resolve();
  el.classList.remove('is-hidden');
  gsap.killTweensOf(el);
  gsap.set(el, { opacity: 0, filter: 'blur(20px)', pointerEvents: 'auto' });
  return new Promise(resolve => {
    gsap.to(el, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: options.duration || 0.8,
      ease: options.ease || 'power2.out',
      delay: options.delay || 0,
      onComplete: resolve
    });
  });
}

// =========================
// ターン進行＋UI表示の共通関数
// =========================
function proceedToNextTurn(aiData) {
  window.currentTurn++;
  // 終了判定
  if (window.currentTurn > 6) {
    hideElementFade(document.querySelector('.js-user-input-parent'));
    hideElementFade(document.querySelector('.js-choices'));
    localStorage.setItem('the_ai_and_i_ended', '1');
    return;
  }

  // ターンごとにUIを明示的に分岐（README最新版準拠）
  if ([1, 2, 4].includes(window.currentTurn)) {
    showUserInputAnimated();
    return;
  } else if (window.currentTurn === 3) {
    if (aiData.choices && aiData.choices.length > 0) {
      showChoicesAnimated();
      return;
    }
  } else if (window.currentTurn === 5) {
    renderChoices([
      { ja: '静かに手を振る', en: 'Wave goodbye in silence' }
    ]);
    showChoicesAnimated();
    return;
  }
  // それ以外は何もしない
}