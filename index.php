<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>The AI and I.</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="assets/css/style.css?v=<?php echo time(); ?>">
  <link rel="icon" href="assets/images/favicon.ico">
  <link rel="canonical" href="https://am1129.work/the-ai-and-i/">
  <meta name="description" content="The AI and I. He/she is here, for now.">

  <meta property="og:title" content="The AI and I.">
  <meta property="og:description" content="The AI and I. He/she is here, for now.">
  <meta property="og:image" content="https://am1129.work/the-ai-and-i/assets/images/ogp.png">
  <meta property="og:url" content="https://am1129.work/the-ai-and-i/">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ja_JP">
  <meta property="og:site_name" content="The AI and I.">
  <meta name="twitter:card" content="summary_large_image">

  <?php include 'assets/includes/head-webfonts.php'; ?>

  <?php include 'assets/includes/head-analytics.php'; ?>

  <?php
    function loadEnv($path) {
      $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
      if (!$lines) return;
      foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($key, $value) = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim($value));
      }
    }
    loadEnv(__DIR__ . '/api/.env');

    $isDebug = getenv('DEBUG_MODE') === 'true';
    if ($isDebug) {
      echo '<script>window.IS_DEBUG=true;</script>';
    } else {
      echo '<script>window.IS_DEBUG=false;</script>';
    }
  ?>
</head>

<body>
  <?php include 'assets/includes/body-analytics.php'; ?>

  <div class="c-loading js-loading is-hidden">
    <svg class="c-loading__spinner" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" stroke="#333" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="80" stroke-dashoffset="60"><animateTransform attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="1s" repeatCount="indefinite"/></circle></svg>
    <div class="c-loading__text">
      <div class="c-loading__text-ja">AIが詩を紡いでいます</div>
      <div class="c-loading__text-en">AI is weaving a poem.</div>
    </div>
  </div><!-- /.c-loading -->

  <div class="l-bg">
    <div class="l-bg-gradient js-bg-gradient">
      <div class="o-bg-ball o-bg-ball1 js-bg-ball"></div>
      <div class="o-bg-ball o-bg-ball2 js-bg-ball"></div>
      <div class="o-bg-ball o-bg-ball3 js-bg-ball"></div>
      <div class="o-bg-ball o-bg-ball4 js-bg-ball"></div>
      <div class="o-bg-ball o-bg-ball5 js-bg-ball"></div>
    </div>
    <div class="l-bg-noise js-bg-noise"></div>
  </div><!-- /.l-bg -->

  <div class="l-content js-content">

    <!-- Talkボタン（初期表示のみ） -->
    <div class="c-first-screen js-first-screen">
      <h1 class="c-first-screen__title js-main-title is-hidden">The AI and I.</h1>
      <h2 class="c-first-screen__subtitle js-main-subtitle is-hidden">対話は一度きりです。<br class="u-only-sp">This conversation will happen only once.
      </h2>
      <div class="c-first-screen__btn js-talk-btn-parent is-hidden">
        <div class="c-talk-btn js-talk-btn">
          <div class="c-talk-btn__ja"><span class="c-talk-btn__arrow">▶</span>話しかける</div>
          <div class="c-talk-btn__en">Talk.</div>
        </div>
      </div>
    </div><!-- /.c-talk-btn-wrap -->

    <!-- AI発話エリア（初期は非表示） -->
    <div class="c-ai-utterance js-ai-utterance is-hidden">
      <div class="c-ai-utterance__content">
        <div class="c-ai-utterance__ja js-ai-ja"></div>
        <div class="c-ai-utterance__en js-ai-en"></div>
      </div>
      <div class="c-ai-poem js-ai-poem is-hidden">
        <div class="c-ai-poem__ja js-ai-poem-ja"></div>
        <div class="c-ai-poem__en js-ai-poem-en"></div>
      </div>
    </div><!-- /.c-ai-utterance -->

    <!-- 選択肢エリア（初期は非表示） -->
    <div class="c-choices js-choices is-hidden">
    </div><!-- /.c-choices -->

    <!-- ユーザー入力欄（初期は非表示） -->
    <div class="c-user-input-parent js-user-input-parent is-hidden">
      <div class="c-user-input js-user-input">
        <div class="c-user-input__guide js-user-input-guide">
          <div class="c-user-input__guide-ja">
            <span class="c-user-input__guide-arrow">▼</span>
            <span class="c-user-input__guide-text js-user-input-guide-ja">AIに挨拶をする</span>
          </div>
          <div class="c-user-input__guide-en js-user-input-guide-en">Say hello to AI.</div>
        </div>
        <div class="c-user-input__inner">
          <input type="text" class="c-user-input__field js-choice-input" maxlength="15" placeholder="最大15文字 / max 15 chars.">
          <button class="c-user-input__btn js-user-input-btn" type="button">SEND</button>
        </div>
      </div>
    </div><!-- /.js-user-input-parent -->

  </div><!-- /.l-content -->

  <footer class="o-footer footer">
    <a href="/" target="_blank">©am1129, <?php echo date('Y'); ?></a>
  </footer><!-- /.o-footer -->

  <!-- JS -->
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/SplitText.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/TextPlugin.min.js"></script>
  <script src="assets/js/script.js?v=<?php echo time(); ?>"></script>
</body>
</html>