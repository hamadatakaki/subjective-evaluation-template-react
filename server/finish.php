<?php
/**
 * ファイルからJSONを読み込み配列として返す
 */
function loadJson(string $filePath): array
{
  if (!file_exists($filePath)) {
    return [];
  }

  $content = file_get_contents($filePath);
  return json_decode($content, true) ?: [];
}

/**
 * 配列をJSONとしてファイルに保存する
 */
function dumpJson(string $filePath, array $data): void
{
  file_put_contents(
    $filePath,
    json_encode(
      $data,
      JSON_PRETTY_PRINT
    ),
    LOCK_EX
  );
}

function sendSuccessResponse(): void
{
  http_response_code(200);
  header('Content-Type: application/json');
  echo json_encode([]);
}

/**
 * エラーレスポンスを返して終了する
 */
function sendErrorResponse(string $reason): void
{
  http_response_code(400);
  header('Content-Type: application/json');
  echo json_encode([
    'reason' => $reason,
  ]);
}


// CORS 設定
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

// HEADER
header('Content-Type: application/json; charset=utf-8');

// MAIN

$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
  sendErrorResponse('invalid-finish');
  exit;
}

// 1. $pid, $sequence, $evaluationsの取得
if (!array_key_exists('pid', $input)) {
  sendErrorResponse('invalid-finish');
  exit;
}

if (!array_key_exists('sequence', $input)) {
  sendErrorResponse('invalid-finish');
  exit;
}

if (!array_key_exists('evaluations', $input)) {
  sendErrorResponse('invalid-finish');
  exit;
}

$pid = $input['pid'];
$sequence = $input['sequence'];
$evaluations = $input['evaluations'];

$finishFile = 'finish-list.json';
$finishArray = loadJson($finishFile);
$finishArray[$pid] = [
  "sequence" => $sequence,
  "evaluations" => $evaluations,
];
dumpJson($finishFile, $finishArray);

sendSuccessResponse();

exit;
?>