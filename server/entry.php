<?php
require_once 'common.php';

const EXPIRE_MINUTES = 30;

$isLocal = getenv("ENVIRONMENT") === "LOCAL";
$sequencesDir = $isLocal ? __DIR__ . '/../public/sequences' : __DIR__ . "/sequences";

/**
 * 指定された日時が期限切れ（EXPIRE_MINUTES以上経過）しているか判定する
 */
function isExpired(DateTime $lastAccess): bool
{
    $now = new DateTime();
    return ($now->getTimestamp() - $lastAccess->getTimestamp()) > (EXPIRE_MINUTES * 60);
}

/**
 * sequences が保存されたディレクトリから counts を初期化
 */
function initializeCountsArray(string $directoryPath): array
{
    $counts = [];

    if (!is_dir($directoryPath))
        return $counts;

    foreach (scandir($directoryPath) as $item) {
        if ($item === '.' || $item === '..')
            continue;

        $fullPath = $directoryPath . DIRECTORY_SEPARATOR . $item;
        if (is_dir($fullPath)) {
            $counts[$item] = 0;
        }
    }
    return $counts;
}

/**
 * 指定ディレクトリの子ディレクトリ数
 */
function countChildren(string $targetPath): int
{
    if (!is_dir($targetPath))
        return 0;

    $count = 0;
    foreach (scandir($targetPath) as $item) {
        if ($item === '.' || $item === '..')
            continue;
        if (is_dir($targetPath . DIRECTORY_SEPARATOR . $item))
            $count++;
    }
    return $count;
}

/**
 * 最小の sequence を返す
 */
function getSequence(string $sequencesDir, array $startData, array $finishData, DateTime $now): string
{
    $counts = initializeCountsArray($sequencesDir);
    $threshold = (clone $now)->modify('-' . EXPIRE_MINUTES . ' minutes');

    foreach ($startData as $entry) {
        if (new DateTime($entry['accessedAt']) >= $threshold) {
            $seq = $entry['sequence'];
            $counts[$seq] = ($counts[$seq] ?? 0) + 1;
        }
    }

    foreach ($finishData as $entry) {
        $seq = $entry['sequence'];
        $counts[$seq] = ($counts[$seq] ?? 0) + 1;
    }

    asort($counts);
    return (string) key($counts);
}

// --- CORS ---
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

date_default_timezone_set('Asia/Tokyo');

// -------- MAIN --------

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input) || !isset($input['pid'])) {
    sendErrorResponse('bad-request');
}

$pid = $input['pid'];
if ($pid === "") {
    sendErrorResponse('invalid-prolific-id');
    exit;
}

// 排他読み込み
$startFile = 'start-list.json';
$finishFile = 'finish-list.json';

$startArray = loadJsonLocked($startFile);
$finishArray = loadJsonLocked($finishFile);

// すでに finish 済み
if (isset($finishArray[$pid])) {
    sendErrorResponse('already-finished');
    exit;
}

$accessedAt = new DateTime();

if (!isset($startArray[$pid])) {
    // 初回 start
    $sequence = getSequence($sequencesDir, $startArray, $finishArray, $accessedAt);
    $sequenceSize = countChildren($sequencesDir . DIRECTORY_SEPARATOR . $sequence);

    $startArray[$pid] = [
        "accessedAt" => $accessedAt->format(DateTime::ISO8601),
        "sequence" => $sequence,
        "sequenceSize" => $sequenceSize
    ];

    writeJsonLocked($startFile, $startArray);

    sendSuccessResponse([
        "sequence" => $sequence,
        "sequenceSize" => $sequenceSize,
    ]);

    exit;
}

// すでに start 済み — 期限切れチェック
$startEntry = $startArray[$pid];
$lastAccess = new DateTime($startEntry['accessedAt']);

if (isExpired($lastAccess)) {
    // 再割り当て
    $sequence = getSequence($sequencesDir, $startArray, $finishArray, $accessedAt);
    $sequenceSize = countChildren($sequencesDir . DIRECTORY_SEPARATOR . $sequence);

    $startArray[$pid] = [
        "accessedAt" => $accessedAt->format(DateTime::ISO8601),
        "sequence" => $sequence,
        "sequenceSize" => $sequenceSize
    ];

    writeJsonLocked($startFile, $startArray);

    sendSuccessResponse([
        "sequence" => $sequence,
        "sequenceSize" => $sequenceSize,
    ]);
    exit;
}

// 期限内アクセス → 同じ sequence を返す
$sequence = $startEntry["sequence"];
$sequenceSize = $startEntry["sequenceSize"];

sendSuccessResponse([
    "sequence" => $sequence,
    "sequenceSize" => $sequenceSize,
]);
exit;
?>