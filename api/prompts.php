function buildPromptForGreeting($input) {
    return "ユーザーはAIにこう話しかけました：「{$input}」。その言葉の温度感に応じて、静かに返答してください。日本語と英語で。JSON形式で返してください。";
}

function buildPromptForTopicSelection($choiceJa, $choiceEn) {
    return "前の挨拶を受けて、{$choiceJa} / {$choiceEn} というテーマを選んだユーザーに、さらに深める問いかけを行ってください。";
}

function buildPromptForFirstPoem($feeling) {
    return "ユーザーはAIの詩に感想を述べました：「{$feeling}」。その感情に寄り添うように、静かで美しい返答を日本語と英語でしてください。";
}

function buildPromptForFarewellSelection($choiceJa, $choiceEn) {
    return "ユーザーは別れに向けて {$choiceJa} / {$choiceEn} を選びました。この選択に合う詩的な対話を準備してください。";
}

function buildPromptForFinalPoem($lastWords) {
    return "ユーザーは最後にこう語りました：「{$lastWords}」。これに応えて、別れをテーマにした短い詩を日本語と英語で返してください。";
}

function buildNgPrompt() {
    return "ユーザーの最初の発言が不適切だったため、静かに別れを告げる文章を詩的に生成してください。JSONで返してください。";
}

function buildPromptForInitial() {
    return "最初のプロンプトとして、シンプルな歓迎のあいさつを日本語と英語で出力してください。";
}
