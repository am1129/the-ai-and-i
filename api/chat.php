<?php
require_once 'prompts.php';

header('Content-Type: application/json');

// POSTから取得
$input = json_decode(file_get_contents('php://input'), true);
$turn = (int)($input['turn'] ?? 0);
$userInput = trim($input['user_input'] ?? '');
$choiceJa = $input['choice']['ja'] ?? '';
$choiceEn = $input['choice']['en'] ?? '';
$history = $input['messages'] ?? [];

// NGワード・インジェクションワードの読み込み
$ngWords = require 'ngwords.php';
$injectWords = require 'inject_words.php';

// ターン1限定の不正検知
$isNg = false;
if ($turn === 1) {
  $combinedCheckWords = array_merge($ngWords, $injectWords);
  foreach ($combinedCheckWords as $word) {
    if (mb_stripos($userInput, $word) !== false) {
      $isNg = true;
      break;
    }
  }
}

// プロンプト構築
if ($isNg) {
  $prompt = buildNgPrompt();
  $messages = [
    ['role' => 'system', 'content' => 'あなたは詩的で静かなAIです。'],
    ['role' => 'user', 'content' => $prompt]
  ];
} else {
    switch ($turn) {
        case 1:
            $prompt = buildPromptForGreeting($userInput);
            break;
        case 2:
            $prompt = buildPromptForTopicSelection($choiceJa, $choiceEn);
            break;
        case 3:
            $prompt = buildPromptForFirstPoem($userInput);
            break;
        case 4:
            $prompt = buildPromptForFarewellSelection($choiceJa, $choiceEn);
            break;
        case 5:
            $prompt = buildPromptForFinalPoem($userInput);
            break;
        default:
            $prompt = buildPromptForInitial();
            break;
    }

    $messages = array_merge(
        [['role' => 'system', 'content' => 'あなたは詩的で静かなAIです。']],
        $history,
        [['role' => 'user', 'content' => $prompt]]
    );
}

// OpenAI API呼び出し
$apiKey = getenv('OPENAI_API_KEY');
$model = getenv('OPENAI_MODEL') ?: 'gpt-4.1-nano-2025-04-14';

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

echo $response;
