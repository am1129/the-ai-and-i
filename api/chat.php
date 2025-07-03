<?php
header('Content-Type: application/json');

function loadEnv($path) {
  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    if (str_starts_with(trim($line), '#')) continue;
    list($key, $value) = explode('=', $line, 2);
    putenv(trim($key) . '=' . trim($value));
  }
}

loadEnv(__DIR__ . '/.env');

$apiKey = getenv('OPENAI_API_KEY');
$model = getenv('OPENAI_MODEL');

$messages = [
  ["role" => "system", "content" => "あなたはとてもやさしい詩人です。"],
  ["role" => "user", "content" => "愛について詩を書いてください。"]
];

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    'Content-Type: application/json',
    'Authorization: ' . 'Bearer ' . $apiKey
  ],
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => json_encode([
    'model' => $model,
    'messages' => $messages,
    'temperature' => 0.9
  ])
]);

$response = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo json_encode(["error" => $err]);
} else {
  echo $response;
}
