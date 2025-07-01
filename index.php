<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>The AI and I</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="assets/css/style.css?v=<?php echo time(); ?>">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300&family=Shippori+Mincho:wght@400&family=Zen+Kaku+Gothic+New:wght@400&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
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
        <span class="c-choice-arrow">▶</span>
        <span class="c-choice-ja">ありがとう</span>
        <span class="c-choice-en">Thank you</span>
      </button>
      <button class="c-choice js-choice">
        <span class="c-choice-arrow">▶</span>
        <span class="c-choice-ja">さようなら</span>
        <span class="c-choice-en">Goodbye</span>
      </button>
      <button class="c-choice js-choice">
        <span class="c-choice-arrow">▶</span>
        <span class="c-choice-ja">また会える？</span>
        <span class="c-choice-en">Will we meet again?</span>
      </button>
    </div>
  </div>
  <footer class="o-footer footer"><a href="https://github.com/am1129/" target="_blank">©am1129, 2025</a></footer>
  <script src="assets/js/script.js?v=<?php echo time(); ?>"></script>
</body>
</html>