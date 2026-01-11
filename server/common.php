<?php
/**
 * ロック付き JSON 読み込み
 */
function loadJsonLocked(string $file): array
{
    if (!file_exists($file)) {
        return [];
    }

    $fp = fopen($file, 'r');
    if (!$fp)
        return [];

    flock($fp, LOCK_SH);
    $content = stream_get_contents($fp);
    flock($fp, LOCK_UN);
    fclose($fp);

    return json_decode($content, true) ?: [];
}

/**
 * ロック付き JSON 書き込み
 */
function writeJsonLocked(string $file, array $data): void
{
    $fp = fopen($file, 'c+'); // create if not exist
    if (!$fp) {
        return;
    }

    flock($fp, LOCK_EX);
    ftruncate($fp, 0);
    rewind($fp);

    fwrite($fp, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

    fflush($fp);
    flock($fp, LOCK_UN);
    fclose($fp);
}

/**
 * 共通レスポンス
 */
function sendErrorResponse(string $reason): void
{
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['reason' => $reason], JSON_UNESCAPED_UNICODE);
}

function sendSuccessResponse($payload = []): void
{
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
}

