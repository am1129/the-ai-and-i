// =========================
// デバッグモード切り替え
// =========================
const isDebug = true; // ←ここをfalseにすれば本番API、trueでダミーJSON

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
  hideElementFade(document.querySelector('.js-user-input'));
  showElementFade(document.querySelector('.js-talk-btn-wrap'));
  // ブラー＋フェードイン演出
  const talkBtnWrap = document.querySelector('.js-talk-btn-wrap');
  gsap.fromTo(talkBtnWrap, {
    opacity: 0,
    filter: 'blur(8px)'
  }, {
    opacity: 1,
    filter: 'blur(0px)',
    duration: 1.2,
    ease: 'power2.out'
  });

  // Talkボタン押下時の処理
  document.querySelector('.js-talk-btn').addEventListener('click', async () => {
    // Talkボタンを消す
    hideElementFade(document.querySelector('.js-talk-btn-wrap'));
    showLoading();
    const apiResponse = await (isDebug ? fetchAiGreetingDummy() : fetchAiGreeting());
    hideLoading();
    console.log(apiResponse);
    let aiData = { ai: { ja: '', en: '' }, poem: null, choices: [] };
    try {
      aiData = JSON.parse(apiResponse.choices?.[0]?.message?.content || '{}');
    } catch (e) {
      console.error('AIレスポンスのJSONパース失敗', e);
    }
    setAiResponseDisplay(aiData);
    startTypewriterEffect(() => {
      showUserInputAnimated();
    });
  });

  // 送信ボタンの処理をターンごとに分岐
  window.currentTurn = 1;
  // セッション終了フラグ
  const SESSION_KEY = 'the_ai_and_i_ended';
  if (sessionStorage.getItem(SESSION_KEY)) {
    showFinalGoodbye();
    return;
  }
  document.querySelector('.js-user-input-btn').addEventListener('click', async () => {
    const inputField = document.querySelector('.js-choice-input');
    const userInput = inputField.value.trim();
    if (!userInput) return;
    hideElementFade(document.querySelector('.js-user-input'));
    showLoading();
    let apiResponse, aiData;
    if (window.currentTurn === 1) {
      // 挨拶入力→テーマ選択肢
      apiResponse = await (isDebug ? fetchAiGreetingWithInputDummy(userInput) : fetchAiGreetingWithInput(userInput));
    } else if (window.currentTurn === 3) {
      // 詩への感想入力→別れのテーマ選択肢
      apiResponse = await (isDebug ? fetchAiWithUserInputDummy(userInput, 3) : fetchAiWithUserInput(userInput, 3));
    } else if (window.currentTurn === 5) {
      // 別れのひと言入力→AI最終詩
      apiResponse = await (isDebug ? fetchAiWithUserInputDummy(userInput, 5) : fetchAiWithUserInput(userInput, 5));
    } else {
      // その他ターンはデフォルトでturn:currentTurn
      apiResponse = await (isDebug ? fetchAiWithUserInputDummy(userInput, window.currentTurn) : fetchAiWithUserInput(userInput, window.currentTurn));
    }
    console.log(apiResponse);
    try {
      aiData = JSON.parse(apiResponse.choices?.[0]?.message?.content || '{}');
    } catch (e) {
      aiData = { ai: { ja: '', en: '' }, poem: null, choices: [] };
      console.error('AIレスポンスのJSONパース失敗', e);
    }
    hideLoading();
    setAiResponseDisplay(aiData);
    startTypewriterEffect(() => {
      if (aiData.choices && aiData.choices.length > 0) {
        showChoicesAnimated();
        window.currentTurn++;
      } else if (window.currentTurn === 5) {
        showUserInputAnimated();
        window.currentTurn++;
      } else if (window.currentTurn === 6) {
        hideElementFade(document.querySelector('.js-user-input'));
        showFinalGoodbye();
        sessionStorage.setItem(SESSION_KEY, '1');
        window.currentTurn++;
      } else {
        showUserInputAnimated();
        window.currentTurn++;
      }
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
    // Turn2: テーマ選択→詩生成、Turn4: 別れテーマ選択→最終詩
    let turnForChoice = window.currentTurn;
    if (window.currentTurn === 2) {
      turnForChoice = 2;
    } else if (window.currentTurn === 4) {
      turnForChoice = 4;
    }
    showLoading();
    const apiResponse = await (isDebug ? fetchAiWithChoiceDummy(choiceJa, choiceEn, turnForChoice) : fetchAiWithChoice(choiceJa, choiceEn, turnForChoice));
    console.log(apiResponse);
    let aiData;
    try {
      aiData = JSON.parse(apiResponse.choices?.[0]?.message?.content || '{}');
    } catch (e) {
      aiData = { ai: { ja: '', en: '' }, poem: null, choices: [] };
      console.error('AIレスポンスのJSONパース失敗', e);
    }
    hideLoading();
    setAiResponseDisplay(aiData);
    startTypewriterEffect(() => {
      if (aiData.choices && aiData.choices.length > 0) {
        showChoicesAnimated();
        window.currentTurn++;
      } else if (window.currentTurn === 2) {
        showUserInputAnimated();
        window.currentTurn++;
      } else if (window.currentTurn === 4) {
        showUserInputAnimated();
        window.currentTurn++;
      } else if (window.currentTurn === 5) {
        // Turn5でお別れの言葉入力→最終詩表示→AIが去る
        showFinalGoodbye();
        sessionStorage.setItem(SESSION_KEY, '1');
        window.currentTurn++;
      } else {
        showUserInputAnimated();
        window.currentTurn++;
      }
    });
  });

  // AIが去った後の静的画面表示
  function showFinalGoodbye() {
    hideElementFade(document.querySelector('.js-ai-utterance'));
    hideElementFade(document.querySelector('.js-choices'));
    hideElementFade(document.querySelector('.js-user-input'));
    const aiJa = document.querySelector('.js-ai-ja');
    const aiEn = document.querySelector('.js-ai-en');
    aiJa.textContent = '彼（彼女）はもういません';
    aiEn.textContent = 'He/She is no longer here.';
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

  // 詩がある場合は4つ、なければ2つ
  let total = 2;
  if (poemJaText || poemEnText) total = 4;
  let finishedCount = 0;
  function onTypewriterFinished() {
    finishedCount++;
    if (finishedCount === total) {
      if (typeof onAllFinished === 'function') onAllFinished();
    }
  }
  typewriterText(aiJa, aiJaText, 100, onTypewriterFinished);
  typewriterText(aiEn, aiEnText, 80, onTypewriterFinished);
  if (poemJaText) typewriterText(poemJa, poemJaText, 100, onTypewriterFinished);
  if (poemEnText) typewriterText(poemEn, poemEnText, 80, onTypewriterFinished);
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
  const userInput = document.querySelector('.js-user-input');
  const guideJa = document.querySelector('.js-user-input-guide-ja');
  const guideEn = document.querySelector('.js-user-input-guide-en');
  if (typeof window.currentTurn !== 'undefined' && window.currentTurn > 6) {
    hideElementFade(userInput);
    guideJa.textContent = '';
    guideEn.textContent = '';
    return;
  }
  // デフォルトはTurn1のガイド
  let jaText = 'AIに挨拶をする';
  let enText = 'Say hello to AI.';
  if (typeof window.currentTurn !== 'undefined') {
    if (window.currentTurn === 2) {
      jaText = '詩の感想を述べる';
      enText = 'Express your feeling about the poem.';
    } else if (window.currentTurn === 4) {
      jaText = 'さよならの挨拶をする';
      enText = 'Say goodbye.';
    }
  }
  guideJa.textContent = jaText;
  guideEn.textContent = enText;
  // is-hidden→is-shownの切り替えを確実に
  userInput.classList.remove('is-hidden');
  userInput.classList.add('is-shown');
  gsap.fromTo(userInput, {
    opacity: 0,
    y: 20,
    filter: 'blur(8px)'
  }, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 1,
    ease: 'power2.out'
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

// デバッグ用静的返答
async function fetchAiGreetingDebug() {
  return {
    ai: { ja: 'こんにちは', en: 'Hello' },
    poem: null,
    choices: null
  };
}

// ユーザー入力送信用API
async function fetchAiGreetingWithInput(userInput) {
  const res = await fetch('api/chat.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turn: 1, user_input: userInput, messages: [] })
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
  choicesWrap.classList.remove('is-hidden');
  const choices = choicesWrap.querySelectorAll('.js-choice');
  choices.forEach((choice, idx) => {
    gsap.fromTo(choice, {
      opacity: 0,
      y: 20,
      filter: 'blur(8px)'
    }, {
      opacity: 1,
      y: 0,
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
  el.classList.remove('is-hidden');
  el.classList.add('is-shown');
}
function hideElementFade(el) {
  el.classList.remove('is-shown');
  el.classList.add('is-hidden');
}
function showLoading() {
  hideElementFade(document.querySelector('.js-ai-utterance'));
  hideElementFade(document.querySelector('.js-choices'));
  hideElementFade(document.querySelector('.js-user-input'));
  hideElementFade(document.querySelector('.js-talk-btn-wrap'));
  showElementFade(document.querySelector('.js-loading'));
}
function hideLoading() {
  hideElementFade(document.querySelector('.js-loading'));
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
  if (aiData.poem && aiData.poem.ja) {
    poemJa.textContent = aiData.poem.ja;
    poemJa.parentElement.classList.remove('is-hidden');
  } else {
    poemJa.textContent = '';
    poemJa.parentElement.classList.add('is-hidden');
  }
  if (aiData.poem && aiData.poem.en) {
    poemEn.textContent = aiData.poem.en;
    poemEn.parentElement.classList.remove('is-hidden');
  } else {
    poemEn.textContent = '';
    poemEn.parentElement.classList.add('is-hidden');
  }
  showElementFade(document.querySelector('.js-ai-utterance'));
  // 選択肢欄を一旦非表示
  hideElementFade(document.querySelector('.js-choices'));
  renderChoices(aiData.choices || []);
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
        ai: { ja: 'こんにちは。私はAIです。あなたに会えて嬉しい。', en: 'Hello. I am AI. I am happy to meet you.' },
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
        ai: { ja: `「${userInput}」ですね。私はあなたの愛の記憶について知りたいです。`, en: `You said: ${userInput}. I want to know about your love memories.` },
        poem: null,
        choices: [
          { ja: '子供の頃の思い出', en: 'Childhood memories' },
          { ja: '家族との温かい時間', en: 'Warm family time' },
          { ja: 'あなたのことが好き', en: 'I like you' }
        ]
      }) } }
    ]
  });
}
function fetchAiWithChoiceDummy(choiceJa, choiceEn, turn) {
  if (turn === 2) {
    return debugDelay({
      choices: [
        { message: { content: JSON.stringify({
          ai: { ja: `「${choiceJa}」の詩を贈ります。`, en: `A poem about ${choiceEn}.` },
          poem: { ja: '静かに幕がおりる。別れの痛みが残る。それでも、愛が残る。', en: 'The curtain falls quietly. The pain of parting remains. But love remains.' },
          choices: []
        }) } }
      ]
    });
  } else if (turn === 4) {
    return debugDelay({
      choices: [
        { message: { content: JSON.stringify({
          ai: { ja: `「${choiceJa}」を胸に、別れの詩を。`, en: `A farewell poem about ${choiceEn}.` },
          poem: { ja: 'やさしさだけが残る朝。', en: 'Only kindness remains in the morning.' },
          choices: []
        }) } }
      ]
    });
  }
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
function fetchAiWithUserInputDummy(userInput, turn) {
  if (turn === 3) {
    return debugDelay({
      choices: [
        { message: { content: JSON.stringify({
          ai: { ja: '感想ありがとう。私はもう去らなくてはいけません。あなたが教えてくれた愛の記憶とともに。', en: 'Thank you for your feeling. I have to leave now. With the love memories you taught me.' },
          poem: null,
          choices: [
            { ja: 'まだ行かないで', en: 'Don\'t go yet' },
            { ja: 'もう少し話したい', en: 'I want to talk more' },
            { ja: '静かに手を振る', en: 'Wave goodbye quietly' }
          ]
        }) } }
      ]
    });
  } else if (turn === 5) {
    return debugDelay({
      choices: [
        { message: { content: JSON.stringify({
          ai: { ja: 'さよなら。もう会うことはありませんが、あなたの思い出の中に。', en: 'Goodbye. I will not see you again, but in your memories.' },
          choices: []
        }) } }
      ]
    });
  }
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