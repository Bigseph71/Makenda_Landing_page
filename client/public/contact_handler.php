<?php
/**
 * contact_handler.php
 * Makenda – Kontaktformular Handler
 * Verarbeitet das Kontaktformular und sendet eine E-Mail an kontakt@makenda.digital
 */

// Konfiguration
define('RECIPIENT_EMAIL', 'kontakt@makenda.digital');
define('RECIPIENT_NAME',  'Makenda');
define('SITE_URL',        'https://makenda.digital');

// Nur POST-Anfragen verarbeiten
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . SITE_URL . '/#contact');
    exit;
}

// Eingaben bereinigen
function sanitize(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

$firstName     = sanitize($_POST['firstName']    ?? '');
$lastName      = sanitize($_POST['lastName']     ?? '');
$company       = sanitize($_POST['company']      ?? '');
$email         = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$preferredDate = sanitize($_POST['preferredDate'] ?? '');
$message       = sanitize($_POST['message']      ?? '');
$consent       = isset($_POST['consent']) ? true : false;

// Pflichtfelder prüfen
$errors = [];
if (empty($firstName))  $errors[] = 'Vorname fehlt.';
if (empty($lastName))   $errors[] = 'Nachname fehlt.';
if (empty($company))    $errors[] = 'Firma fehlt.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Ungültige E-Mail-Adresse.';
if (empty($message))    $errors[] = 'Nachricht fehlt.';
if (!$consent)          $errors[] = 'Bitte stimmen Sie der Datenschutzerklärung zu.';

if (!empty($errors)) {
    // Fehler: zurück zum Formular
    $errorQuery = urlencode(implode(' | ', $errors));
    header('Location: ' . SITE_URL . '/#contact?error=' . $errorQuery);
    exit;
}

// E-Mail zusammenstellen
$fullName    = $firstName . ' ' . $lastName;
$subject     = '=?UTF-8?B?' . base64_encode('Neue Kontaktanfrage von ' . $fullName) . '?=';

$body  = "Neue Kontaktanfrage über makenda.digital\n";
$body .= str_repeat('-', 50) . "\n\n";
$body .= "Name:            " . $fullName . "\n";
$body .= "Firma:           " . $company . "\n";
$body .= "E-Mail:          " . $email . "\n";
if (!empty($preferredDate)) {
    $body .= "Gewünschter Termin: " . $preferredDate . "\n";
}
$body .= "\nNachricht:\n" . $message . "\n\n";
$body .= str_repeat('-', 50) . "\n";
$body .= "Datenschutz-Einwilligung: Ja\n";
$body .= "Gesendet am: " . date('d.m.Y H:i:s') . "\n";

// E-Mail-Header
$headers  = 'From: =?UTF-8?B?' . base64_encode(RECIPIENT_NAME . ' Kontaktformular') . '?= <noreply@makenda.digital>' . "\r\n";
$headers .= 'Reply-To: ' . $fullName . ' <' . $email . '>' . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$headers .= 'Content-Transfer-Encoding: base64' . "\r\n";

// E-Mail senden
$sent = mail(RECIPIENT_EMAIL, $subject, base64_encode($body), $headers);

if ($sent) {
    header('Location: ' . SITE_URL . '/#contact?success=1');
} else {
    header('Location: ' . SITE_URL . '/#contact?error=mail_failed');
}
exit;
