<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>The AI and I</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="assets/css/style.css?v=<?php echo time(); ?>">
  <link rel="icon" href="assets/images/favicon.ico">
  <link rel="canonical" href="https://am1129.work/the-ai-and-i/">
  <meta name="description" content="The AI and I. He/she is here, for now.">
  <meta property="og:title" content="The AI and I">
  <meta property="og:description" content="The AI and I. He/she is here, for now.">
  <meta property="og:image" content="https://am1129.work/the-ai-and-i/assets/images/ogp.png">
  <meta property="og:url" content="https://am1129.work/the-ai-and-i/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:site_name" content="The AI and I">
  <meta name="twitter:card" content="summary_large_image">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300&family=Shippori+Mincho:wght@400&family=Zen+Kaku+Gothic+New:wght@400&display=swap" rel="stylesheet">
</head>
<body>
  <div class="l-bg">
    <div class="l-bg-gradient js-bg-gradient">
      <div class="o-bg-ball o-bg-ball1 js-bg-ball"></div>
      <div class="o-bg-ball o-bg-ball2 js-bg-ball"></div>
      <div class="o-bg-ball o-bg-ball3 js-bg-ball"></div>
      <div class="o-bg-ball o-bg-ball4 js-bg-ball"></div>
      <div class="o-bg-ball o-bg-ball5 js-bg-ball"></div>
    </div>
    <div class="l-bg-noise js-bg-noise"></div>
  </div>
  <div class="l-content js-content">
    <div class="c-ai-utterance js-ai-utterance">
      <div class="c-ai-ja">あなたに会えてよかった。</div>
      <div class="c-ai-en">I'm glad I met you.</div>
    </div>
    <div class="c-choices js-choices">
      <button class="c-choice js-choice">
        <span class="c-choice__arrow">▶</span>
        <span class="c-choice__ja">ありがとう</span>
        <span class="c-choice__en">Thank you</span>
      </button>
      <button class="c-choice js-choice">
        <span class="c-choice__arrow">▶</span>
        <span class="c-choice__ja">さようなら</span>
        <span class="c-choice__en">Goodbye</span>
      </button>
      <button class="c-choice js-choice">
        <span class="c-choice__arrow">▶</span>
        <span class="c-choice__ja">また会える？</span>
        <span class="c-choice__en">Will we meet again?</span>
      </button>
    </div>
    <div class="c-user-input">
      <input type="text" class="c-user-input__field js-choice-input" maxlength="10" placeholder="自由入力（10文字まで）">
      <button class="c-user-input__btn" type="button">SEND</button>
    </div>
  </div>
  <footer class="o-footer footer"><a href="https://github.com/am1129/" target="_blank">©am1129, 2025</a></footer>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
  <script src="assets/js/script.js?v=<?php echo time(); ?>"></script>
</body>
</html>