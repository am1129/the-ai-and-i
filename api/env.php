<?php
/**
 * .envファイルを読み込んで環境変数にセットする共通関数
 * @param string $path .envファイルのパス
 */
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