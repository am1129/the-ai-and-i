<?php
// セッションリセット用ページ
?><!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>セッションリセット | The AI and I.</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <meta name="robots" content="noindex, nofollow">
  <script>
    // 対話終了フラグなどを削除
    localStorage.removeItem('the_ai_and_i_ended');
    // 必要なら他のキーもここで削除
    // localStorage.clear(); // ←全削除したい場合はこちら
    // index.phpにリダイレクト
    window.location.replace('index.php');
  </script>
</head>
<body>
  <noscript>
    JavaScriptが無効です。手動で<a href="index.php">トップページ</a>に戻ってください。
  </noscript>
</body>
</html> 