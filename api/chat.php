<?php
require_once(__DIR__ . '/prompts.php');
header('Content-Type: application/json');

// 環境変数の読み込み（.env 対応）
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
$model = getenv('OPENAI_MODEL') ?: 'gpt-4o';

// 入力を受け取る
$input = json_decode(file_get_contents('php://input'), true);
$messages = $input['messages'] ?? null;

if (!$messages) {
  // messagesが来てなかったら、単発のやり取りとみなして生成
  $turn = (int) ($input['turn'] ?? 0);
  $choiceJa = $input['choice']['ja'] ?? '';
  $choiceEn = $input['choice']['en'] ?? '';
  $prompt = buildJsonPromptForTurn($turn, $choiceJa, $choiceEn);
  $messages = [
    ['role' => 'system', 'content' => 'あなたは詩的でやさしいAIです。'],
    ['role' => 'user', 'content' => $prompt]
  ];
}

// ChatGPT APIに送信
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
    'temperature' => 0.7
  ])
]);

$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);
$jsonString = $data['choices'][0]['message']['content'] ?? '{}';
$result = json_decode($jsonString, true);

// JSONとして返す
echo json_encode($result, JSON_UNESCAPED_UNICODE);

