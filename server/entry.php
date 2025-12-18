<?php
const EXPIRE_MINUTES = 30;

$isLocal = getenv("ENVIRONMENT") === "LOCAL";
$sequencesDir = $isLocal ? __DIR__ . '/../public/sequences' : __DIR__ . "/sequences";

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

/**
 * 指定された日時が期限切れ（EXPIRE_MINUTES以上経過）しているか判定する
 */
function isExpired(DateTime $lastAccess): bool
{
    $now = new DateTime();
    $diffSeconds = $now->getTimestamp() - $lastAccess->getTimestamp();
    return $diffSeconds > (EXPIRE_MINUTES * 60);
}

/**
 * sequencesが保存されたディレクトリのパスを受け取り、counts配列を初期化して返す関数
 */
function initializeCountsArray(string $directoryPath): array
{
    $counts = [];

    if (!is_dir($directoryPath)) {
        return $counts;
    }

    $items = scandir($directoryPath);

    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }

        $fullPath = rtrim($directoryPath, '/\\') . DIRECTORY_SEPARATOR . $item;

        if (is_dir($fullPath)) {
            $counts[$item] = 0;
        }
    }

    return $counts;
}

/**
 * 指定されたディレクトリの子ディレクトリの数を数える関数
 */
function countChildren(string $targetPath): int
{
    if (!is_dir($targetPath)) {
        return 0;
    }

    $count = 0;
    $items = scandir($targetPath);
    foreach ($items as $item) {
        if ($item === '.' || $item === '..') {
            continue;
        }
        if (is_dir($targetPath . DIRECTORY_SEPARATOR . $item)) {
            $count++;
        }
    }

    return $count;
}

/**
 * 出現回数を集計して最小のsequenceを返す
 * * JSON形式になったため、ループ処理がシンプルになります
 */
function getSequence(string $sequencesDir, array $startData, array $finishData, DateTime $now): string
{
    $counts = initializeCountsArray($sequencesDir);
    $threshold = (clone $now)->modify('-' . EXPIRE_MINUTES . ' minutes');

    // start-listの集計
    foreach ($startData as $entry) {
        if (new DateTime($entry['accessedAt']) >= $threshold) {
            $seq = $entry['sequence'];
            $counts[$seq] = ($counts[$seq] ?? 0) + 1;
        }
    }

    // finish-listの集計
    foreach ($finishData as $entry) {
        $seq = $entry['sequence'];
        $counts[$seq] = ($counts[$seq] ?? 0) + 1;
    }

    asort($counts);
    return (string) key($counts);
}

/**
 * 成功レスポンスを返して終了する
 */
function sendSuccessResponse(string $sequence, int $sequenceSize): void
{
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode([
        "sequence" => $sequence,
        "sequenceSize" => $sequenceSize,
    ]);
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

date_default_timezone_set('Asia/Tokyo');

// MAIN
$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    sendErrorResponse('bad-request');
    exit;
}

// $sequence の計算

$accessedAt = new DateTime();

// 1. $pidの取得
if (!array_key_exists('pid', $input)) {
    sendErrorResponse('invalid-prolific-id');
    exit;
}

$pid = $input["pid"];

if ($pid === "") {
    sendErrorResponse('invalid-prolific-id');
    exit;
}

// 2. finish-listの中にpidが含まれているかチェック

$finishFile = 'finish-list.json';
$finishArray = loadJson($finishFile);

if (isset($finishArray[$pid])) {
    sendErrorResponse('already-finished');
    exit;
}

// 3. start-listの中にpidが含まれているか、expireされているかチェック

$startFile = 'start-list.json';
$startArray = loadJson($startFile);

if (!isset($startArray[$pid])) {
    // start-listに未登録の場合
    $sequence = getSequence($sequencesDir, $startArray, $finishArray, $accessedAt);
    $sequenceSize = countChildren($sequencesDir . DIRECTORY_SEPARATOR . $sequence);

    sendSuccessResponse(
        $sequence,
        $sequenceSize
    );

    $startArray[$pid] = [
        "accessedAt" => $accessedAt->format(DateTime::ISO8601),
        "sequence" => $sequence,
        "sequenceSize" => $sequenceSize
    ];
    dumpJson($startFile, $startArray);
    exit;
}

$startEntry = $startArray[$pid];
$lastAccess = new DateTime($startEntry['accessedAt']);

if (isExpired($lastAccess)) {
    // expiredされている場合
    $sequence = getSequence($sequencesDir, $startArray, $finishArray, $accessedAt);
    $sequenceSize = countChildren($sequencesDir . DIRECTORY_SEPARATOR . $sequence);

    sendSuccessResponse(
        $sequence,
        $sequenceSize
    );

    $startArray[$pid] = [
        "accessedAt" => $accessedAt->format(DateTime::ISO8601),
        "sequence" => $sequence,
        "sequenceSize" => $sequenceSize
    ];
    dumpJson($startFile, $startArray);
    exit;
}

// すでにstart済みの場
$sequence = $startEntry["sequence"];
$sequenceSize = $startEntry["sequenceSize"];

sendSuccessResponse(
    $sequence,
    $sequenceSize
);

$startArray[$pid] = [
    "accessedAt" => $accessedAt->format(DateTime::ISO8601),
    "sequence" => $sequence,
    "sequenceSize" => $sequenceSize
];
dumpJson($startFile, $startArray);
exit;
?>