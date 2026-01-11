<?php
require_once 'common.php';

// ----- CORS -----
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

header('Content-Type: application/json; charset=utf-8');

// ----- MAIN -----

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input) || !isset($input['pid'], $input['sequence'], $input['evaluations'])) {
  sendErrorResponse('invalid-finish');
}

$pid = $input['pid'];
$sequence = $input['sequence'];
$evaluations = $input['evaluations'];

// finish-list.json の更新
$finishFile = 'finish-list.json';
$finishArray = loadJsonLocked($finishFile);

$finishArray[$pid] = [
  "sequence" => $sequence,
  "finished_at" => time(),
];

writeJsonLocked($finishFile, $finishArray);

// output/$pid.json へ evaluations & sequence 保存
$outputDir = __DIR__ . '/output';
if (!is_dir($outputDir))
  mkdir($outputDir, 0777, true);

$outputFile = $outputDir . "/$sequence-$pid.json";

writeJsonLocked($outputFile, [
  "pid" => $pid,
  "sequence" => $sequence,
  "evaluations" => $evaluations
]);

sendSuccessResponse();
exit;
?>