<?php
require_once 'prompts.php';

header('Content-Type: application/json');

// 環境変数の読み込み（.env を使っている場合）
function loadEnv($path) {
  $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  foreach ($lines as $line) {
    if (str_starts_with(trim($line), '#')) continue;
    list($key, $value) = explode('=', $line, 2);
    putenv(trim($key) . '=' . trim($value));
  }
}
loadEnv(__DIR__ . '/.env');

// OpenAI API呼び出し
$apiKey = getenv('OPENAI_API_KEY');
$model = getenv('OPENAI_MODEL') ?: 'gpt-4.1-nano-2025-04-14';

// POSTから取得
$input = json_decode(file_get_contents('php://input'), true);
$turn = (int)($input['turn'] ?? 0);
$userInput = trim($input['user_input'] ?? '');
$choiceJa = $input['choice']['ja'] ?? '';
$choiceEn = $input['choice']['en'] ?? '';
$messages = $input['messages'] ?? [];

// 不正検知
$isNg = false;
$moderationResult = callModerationAPI($userInput);
if ($moderationResult['flagged']) {
  $isNg = true;
}

//システムプロンプト
$systemPrompt = buildSystemPrompt();

// ターンごとのプロンプト構築
if ($isNg) {
  $prompt = buildNgPrompt();
  $messages = [
    ['role' => 'system', 'content' => $systemPrompt],
    ['role' => 'user', 'content' => $prompt]
  ];
} else {
  switch ($turn) {
    case 1:
      $prompt = buildPromptForGreeting($userInput);
      break;
    case 2:
      $prompt = buildPromptForTopicSelection($userInput);
      break;
    case 3:
      $prompt = buildPromptForFirstPoem($choiceJa, $choiceEn);
      break;
    case 4:
      $prompt = buildPromptForFarewellSelection($userInput);
      break;
    case 5:
      $prompt = buildPromptForFinalPoem();
      break;
    default:
      $prompt = buildPromptForInitial();
      break;
  }

  $messages = array_merge(
    [['role' => 'system', 'content' => $systemPrompt]],
    $messages,
    [['role' => 'user', 'content' => $prompt]]
  );
}

$payload = json_encode([
  'model' => $model,
  'messages' => $messages,
  'temperature' => 0.8
]);

$ch = curl_init('https://api.openai.com/v1/chat/completions');
curl_setopt_array($ch, [
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_HTTPHEADER => [
    "Content-Type: application/json",
    "Authorization: Bearer $apiKey"
  ],
  CURLOPT_POST => true,
  CURLOPT_POSTFIELDS => $payload
]);

$response = curl_exec($ch);
curl_close($ch);

// OpenAI APIのレスポンスをデコード
$data = json_decode($response, true);
if (isset($data['choices'][0]['message']['content'])) {
  $content = $data['choices'][0]['message']['content'];
  // contentがJSON文字列の場合はデコード
  $contentObj = json_decode($content, true);
  if ($contentObj !== null) {
      $data['choices'][0]['message']['content'] = $contentObj;
  }
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);


// ===== Moderation API 呼び出し関数 =====
function callModerationAPI(string $text): array {
  global $apiKey;
  $ch = curl_init('https://api.openai.com/v1/moderations');
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
    'Content-Type: application/json',
    "Authorization: Bearer $apiKey"
    ],
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode(['input' => $text])
  ]);
  $result = curl_exec($ch);
  curl_close($ch);

  $json = json_decode($result, true);
  return [
    'flagged' => $json['results'][0]['flagged'] ?? false,
    'categories' => $json['results'][0]['categories'] ?? []
  ];
}