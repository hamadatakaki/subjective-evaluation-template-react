<?php
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
  error_log("(debug) invalid json data");
  http_response_code(400);
  echo json_encode(['error' => 'invalid json data']);
  exit;
}

if (!array_key_exists('hoge', $input)) {
  error_log("(debug) messing: hoge");
  http_response_code(400);
  echo json_encode(['error' => 'missing: hoge']);
  exit;
}

$message = $input["hoge"];

echo json_encode([
  'status' => 'ok',
  'message' => $message,
]);

exit;
?>