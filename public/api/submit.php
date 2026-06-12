<?php
declare(strict_types=1);

/*
 * Font-submission handler for the ABC Type Foundry site (STRATO hosting).
 *
 * This is the PHP equivalent of the old Node server (server/index.js). STRATO
 * shared webhosting can't run Node, but it runs PHP, so the React form in
 * src/Submit.jsx POSTs here instead. It emails the submission (name, email,
 * message + the attached font file) using PHP's built-in mail(), which on
 * STRATO relays through their mail servers — so a From address on your own
 * domain passes SPF/DKIM. No SMTP password is stored anywhere.
 *
 * The frontend calls /api/submit; the .htaccess rewrite maps that to this file.
 */

// ── Settings ────────────────────────────────────────────────────────────────
// Where submissions are delivered. Create this mailbox in the STRATO panel.
const SUBMIT_TO   = 'webmaster@abvtype.com';
// The From address. MUST be a real mailbox on your STRATO domain so the mail
// passes SPF/DKIM and doesn't land in spam. Use the same as SUBMIT_TO.
const SUBMIT_FROM = 'webmaster@abvtype.com';
// Largest accepted attachment (mirrors the old 15 MB Node limit). Keep this in
// step with upload_max_filesize / post_max_size in .user.ini.
const MAX_FILE_BYTES = 15 * 1024 * 1024;

header('Content-Type: application/json; charset=utf-8');

function fail(int $status, string $message)
{
    http_response_code($status);
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    fail(405, 'Method not allowed.');
}

// ── Read and validate the form fields ───────────────────────────────────────
$name    = trim($_POST['name'] ?? '');
$email   = trim($_POST['email'] ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '') {
    fail(400, 'Name and email are required.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(400, 'A valid email is required.');
}

// ── Validate the optional upload ─────────────────────────────────────────────
$file    = $_FILES['attachment'] ?? null;
$hasFile = $file && ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK;

if ($file && ($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_INI_SIZE) {
    fail(413, 'File is too large.');
}
if ($file
    && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK
    && ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
    fail(400, 'File upload failed.');
}
if ($hasFile && $file['size'] > MAX_FILE_BYTES) {
    fail(413, 'File is too large (15 MB max).');
}
// Guard against header injection via the filename.
$fileName = $hasFile ? str_replace(["\r", "\n", '"'], '', basename($file['name'])) : '';

// ── Compose the message ──────────────────────────────────────────────────────
$text =
    "New font submission\n\n" .
    "Name: {$name}\n" .
    "Email: {$email}\n\n" .
    "Message:\n" . ($message !== '' ? $message : '(none)') . "\n\n" .
    'Attached file: ' . ($hasFile ? $fileName : '(none)');

// Encode the subject so non-ASCII names (e.g. Cyrillic) survive transit; this
// also neutralises any header-injection attempt in $name.
$subject = '=?UTF-8?B?' . base64_encode("New font submission \xE2\x80\x94 {$name}") . '?=';

// Reply-To is the submitter so you can answer them directly. Strip CR/LF.
$replyTo = str_replace(["\r", "\n"], '', $email);

$headers = [
    'From: ABC Type Foundry <' . SUBMIT_FROM . '>',
    'Reply-To: ' . $replyTo,
    'MIME-Version: 1.0',
];

if ($hasFile) {
    // multipart/mixed: plain-text part + base64 attachment.
    $boundary = '=_' . bin2hex(random_bytes(16));
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $boundary . '"';

    $encoded = chunk_split(base64_encode((string) file_get_contents($file['tmp_name'])));

    $body  = "--{$boundary}\r\n";
    $body .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $body .= $text . "\r\n\r\n";
    $body .= "--{$boundary}\r\n";
    $body .= "Content-Type: application/octet-stream; name=\"{$fileName}\"\r\n";
    $body .= "Content-Transfer-Encoding: base64\r\n";
    $body .= "Content-Disposition: attachment; filename=\"{$fileName}\"\r\n\r\n";
    $body .= $encoded . "\r\n";
    $body .= "--{$boundary}--";
} else {
    $headers[] = 'Content-Type: text/plain; charset=UTF-8';
    $body = $text;
}

// ── Send ─────────────────────────────────────────────────────────────────────
$ok = mail(SUBMIT_TO, $subject, $body, implode("\r\n", $headers));

if ($ok) {
    echo json_encode(['success' => true]);
} else {
    error_log('submit.php: mail() returned false');
    fail(502, 'Could not send the email.');
}
