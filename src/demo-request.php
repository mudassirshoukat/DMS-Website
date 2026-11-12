<?php
/*
 * Request a demo form handler for the Peaplexa website.
 *
 * The form on /request-a-demo/ posts here. Every request is emailed to the company inbox with PHP mail(),
 * the same way the Datagonomix and VelorHR sites send theirs on Plesk hosting. The page asks for JSON and
 * shows "Thanks" only when the mail server accepted the email. Without JavaScript the form still posts here
 * and gets a short page back.
 *
 * Before going live: SENDER_EMAIL has to be an address on a domain this server is allowed to send from.
 */

define('RECIPIENT_EMAIL', 'info@datagonomix.com');
define('SENDER_EMAIL', 'no-reply@datagonomix.com');
define('FORM_PAGE', '/request-a-demo/');

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

// A PHP warning printed into the reply would break the JSON the page reads.
ini_set('display_errors', '0');

function respond($status, $ok, $message)
{
    global $wantsJson;
    // The page (JSON) gets the real status. The plain page for visitors without JavaScript always gets 200,
    // because IIS on Plesk swaps a 400 or 500 body for its own error page and the visitor would lose the message.
    http_response_code($wantsJson ? $status : 200);
    header('Cache-Control: no-store');
    if ($wantsJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message]);
        exit;
    }
    header('Content-Type: text/html; charset=utf-8');
    $title = $ok ? 'Thanks, your request was sent' : 'Your request was not sent';
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
        . '<meta name="viewport" content="width=device-width, initial-scale=1">'
        . '<meta name="robots" content="noindex">'
        . '<title>' . htmlspecialchars($title) . ' | Peaplexa</title></head>'
        . '<body style="font-family: system-ui, sans-serif; max-width: 36rem; margin: 4rem auto; padding: 0 16px; line-height: 1.6">'
        . '<h1 style="font-size: 1.5rem">' . htmlspecialchars($title) . '</h1>'
        . '<p>' . htmlspecialchars($message) . '</p>'
        . '<p><a href="' . FORM_PAGE . '">Back to Request a demo</a></p>'
        . '</body></html>';
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, false, 'Please use the form on the Request a demo page.');
}

// Hidden field that people never see. Bots fill it in; they get a normal answer and nothing is sent.
if (!empty($_POST['website'])) {
    respond(200, true, 'The Peaplexa team will write back to you.');
}

function cut($value, $max)
{
    return function_exists('mb_substr') ? mb_substr($value, 0, $max, 'UTF-8') : substr($value, 0, $max);
}

function size($value)
{
    return function_exists('mb_strlen') ? mb_strlen($value, 'UTF-8') : strlen($value);
}

// One line only: line breaks go, which also keeps them out of the email headers.
function one_line($value, $max)
{
    $value = is_string($value) ? $value : '';
    return cut(trim(preg_replace('/[\r\n\t\0]+/', ' ', $value)), $max);
}

$name    = one_line($_POST['name'] ?? '', 120);
$email   = one_line($_POST['email'] ?? '', 200);
$company = one_line($_POST['company'] ?? '', 160);
$message = is_string($_POST['message'] ?? null) ? cut(trim(str_replace("\0", '', $_POST['message'])), 4000) : '';

if (size($name) < 2 || $company === '' || size($message) < 10) {
    respond(400, false, 'Please fill in your name, company and a short message.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(400, false, 'Please enter a work email address like name@company.com.');
}

$subject = 'Peaplexa demo request from ' . $company;
$body = "New demo request from the Peaplexa website\n\n"
      . "Name: " . $name . "\n"
      . "Work email: " . $email . "\n"
      . "Company: " . $company . "\n\n"
      . "Message:\n" . $message . "\n\n"
      . "Sent: " . gmdate('Y-m-d H:i') . " UTC\n";

$headers = "From: Peaplexa Website <" . SENDER_EMAIL . ">\r\n"
         . "Reply-To: " . $email . "\r\n"
         . "MIME-Version: 1.0\r\n"
         . "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail(RECIPIENT_EMAIL, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);

if ($sent) {
    respond(200, true, 'The Peaplexa team will write back to you.');
}
respond(500, false, 'Please try again in a moment, or write to ' . RECIPIENT_EMAIL . '.');
