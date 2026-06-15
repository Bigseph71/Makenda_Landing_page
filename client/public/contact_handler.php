<?php
/**
 * contact_handler.php
 * Makenda – Kontaktformular Handler
 * Verarbeitet das Kontaktformular und sendet eine E-Mail an kontakt@makenda.digital
 *
 * CORRECTIONS:
 * - Utilise une redirection relative (fonctionne sur tout hébergeur sans config de domaine)
 * - Paramètre ?status=success / ?status=error (cohérent avec script.js)
 * - Content-Transfer-Encoding 8bit (évite le double-encodage base64)
 */

define('RECIPIENT_EMAIL', 'kontakt@makenda.digital');
define('RECIPIENT_NAME',  'Makenda');

// Redirection relative vers index.html dans le même répertoire
function redirect(string $status, string $msg = ''): void {
    $script = $_SERVER['SCRIPT_NAME'] ?? '/contact_handler.php';
    $dir    = rtrim(dirname($script), '/');
    $url    = $dir . '/index.html#contact';
    // Paramètre query AVANT le fragment (le JS lit window.location.search)
    $query  = '?status=' . rawurlencode($status);
    if ($msg !== '') {
        $query .= '&msg=' . rawurlencode($msg);
    }
    // Injecter le query string dans l'URL (avant le #)
    $url = $dir . '/index.html' . $query . '#contact';
    header('Location: ' . $url);
    exit;
}

// Nur POST-Anfragen
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('error', 'Ungültige Anfrage.');
}

// Eingaben bereinigen
function sanitize(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

$firstName     = sanitize($_POST['firstName']     ?? '');
$lastName      = sanitize($_POST['lastName']      ?? '');
$company       = sanitize($_POST['company']       ?? '');
$email         = filter_var(trim($_POST['email']  ?? ''), FILTER_SANITIZE_EMAIL);
$preferredDate = sanitize($_POST['preferredDate'] ?? '');
$message       = sanitize($_POST['message']       ?? '');
$consent       = isset($_POST['consent']);

// Pflichtfelder prüfen
$errors = [];
if (empty($firstName))                          $errors[] = 'Vorname fehlt.';
if (empty($lastName))                           $errors[] = 'Nachname fehlt.';
if (empty($company))                            $errors[] = 'Firma fehlt.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Ungültige E-Mail-Adresse.';
if (empty($message))                            $errors[] = 'Nachricht fehlt.';
if (!$consent)                                  $errors[] = 'Bitte stimmen Sie der Datenschutzerklärung zu.';

if (!empty($errors)) {
    redirect('error', implode(' | ', $errors));
}

// E-Mail zusammenstellen
$fullName = $firstName . ' ' . $lastName;
$subject  = '=?UTF-8?B?' . base64_encode('Neue Kontaktanfrage von ' . $fullName . ' – makenda.digital') . '?=';

$body  = "Neue Kontaktanfrage über makenda.digital\n";
$body .= str_repeat('-', 50) . "\n\n";
$body .= "Name:               " . $fullName . "\n";
$body .= "Firma:              " . $company . "\n";
$body .= "E-Mail:             " . $email . "\n";
if (!empty($preferredDate)) {
    $body .= "Gewünschter Termin: " . $preferredDate . "\n";
}
$body .= "\nNachricht:\n" . $message . "\n\n";
$body .= str_repeat('-', 50) . "\n";
$body .= "Datenschutz-Einwilligung: Ja\n";
$body .= "Gesendet am: " . date('d.m.Y H:i:s') . "\n";

// E-Mail-Header (8bit – kein doppeltes base64)
$headers  = 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$headers .= 'Content-Transfer-Encoding: 8bit' . "\r\n";
$headers .= 'From: Makenda Kontaktformular <noreply@makenda.digital>' . "\r\n";
$headers .= 'Reply-To: ' . $fullName . ' <' . $email . '>' . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion() . "\r\n";

// E-Mail senden (body NICHT base64-encodieren – Content-Transfer-Encoding ist 8bit)
$sent = mail(RECIPIENT_EMAIL, $subject, $body, $headers);

if ($sent) {
    redirect('success');
} else {
    // Fehler loggen (nur wenn Schreibrechte vorhanden)
    @file_put_contents(
        __DIR__ . '/mail_error.log',
        date('Y-m-d H:i:s') . " mail() failed – from: " . $email . "\n",
        FILE_APPEND
    );
    redirect('error', 'E-Mail konnte nicht gesendet werden. Bitte kontaktieren Sie uns direkt: kontakt@makenda.digital');
}
