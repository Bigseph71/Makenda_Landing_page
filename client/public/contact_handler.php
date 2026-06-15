<?php
/**
 * contact_handler.php
 * Makenda – Kontaktformular Handler
 *
 * Sendet:
 *  1. Benachrichtigung an kontakt@makenda.digital
 *  2. Bestätigungs-E-Mail an den Absender (auch Yahoo, Gmail, etc.)
 */

define('RECIPIENT_EMAIL', 'kontakt@makenda.digital');
define('RECIPIENT_NAME',  'Makenda');
define('SENDER_DOMAIN',   'makenda.digital');

// Redirection relative
function redirect(string $status, string $msg = ''): void {
    $script = $_SERVER['SCRIPT_NAME'] ?? '/contact_handler.php';
    $dir    = rtrim(dirname($script), '/');
    $query  = '?status=' . rawurlencode($status);
    if ($msg !== '') {
        $query .= '&msg=' . rawurlencode($msg);
    }
    $url = $dir . '/index.html' . $query . '#contact';
    header('Location: ' . $url);
    exit;
}

// Nur POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('error', 'Ungültige Anfrage.');
}

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

// Datum-Validierung: mindestens morgen, nur Mo–Fr
$formattedDate = '';
if (!empty($preferredDate)) {
    $dateObj  = DateTime::createFromFormat('Y-m-d', $preferredDate);
    $tomorrow = new DateTime('tomorrow');
    $tomorrow->setTime(0, 0, 0);
    if (!$dateObj) {
        $errors[] = 'Ungültiges Datum.';
    } elseif ($dateObj < $tomorrow) {
        $errors[] = 'Bitte wählen Sie ein Datum ab morgen.';
    } else {
        $dow = (int)$dateObj->format('N'); // 1=Mo … 7=So
        if ($dow >= 6) {
            $errors[] = 'Bitte wählen Sie einen Werktag (Montag–Freitag).';
        } else {
            $formattedDate = $dateObj->format('d.m.Y');
        }
    }
}

if (!empty($errors)) {
    redirect('error', implode(' | ', $errors));
}

$fullName = $firstName . ' ' . $lastName;

// ─── 1. Benachrichtigung an Makenda ──────────────────────────────────────────
$subjectAdmin = '=?UTF-8?B?' . base64_encode('Neue Kontaktanfrage von ' . $fullName . ' – makenda.digital') . '?=';

$bodyAdmin  = "Neue Kontaktanfrage ueber makenda.digital\n";
$bodyAdmin .= str_repeat('-', 50) . "\n\n";
$bodyAdmin .= "Name:               " . $fullName . "\n";
$bodyAdmin .= "Firma:              " . $company . "\n";
$bodyAdmin .= "E-Mail:             " . $email . "\n";
if ($formattedDate !== '') {
    $bodyAdmin .= "Gewuenschter Termin: " . $formattedDate . "\n";
}
$bodyAdmin .= "\nNachricht:\n" . $message . "\n\n";
$bodyAdmin .= str_repeat('-', 50) . "\n";
$bodyAdmin .= "Datenschutz-Einwilligung: Ja\n";
$bodyAdmin .= "Gesendet am: " . date('d.m.Y H:i:s') . "\n";

$headersAdmin  = 'MIME-Version: 1.0' . "\r\n";
$headersAdmin .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$headersAdmin .= 'Content-Transfer-Encoding: 8bit' . "\r\n";
$headersAdmin .= 'From: Makenda Kontaktformular <noreply@' . SENDER_DOMAIN . '>' . "\r\n";
$headersAdmin .= 'Reply-To: ' . $fullName . ' <' . $email . '>' . "\r\n";
$headersAdmin .= 'X-Mailer: PHP/' . phpversion() . "\r\n";

$sentAdmin = mail(RECIPIENT_EMAIL, $subjectAdmin, $bodyAdmin, $headersAdmin);

// ─── 2. Bestätigung an den Absender (Yahoo, Gmail, etc.) ─────────────────────
// From muss auf der eigenen Domain liegen – sonst lehnen Yahoo/Gmail ab (SPF/DKIM)
$subjectConfirm = '=?UTF-8?B?' . base64_encode('Ihre Anfrage bei Makenda – wir melden uns bald!') . '?=';

$bodyConfirm  = "Guten Tag " . $firstName . ",\n\n";
$bodyConfirm .= "vielen Dank fuer Ihre Nachricht! Wir haben Ihre Anfrage erhalten und werden uns\n";
$bodyConfirm .= "innerhalb von 1-2 Werktagen bei Ihnen melden.\n\n";
$bodyConfirm .= "Ihre Angaben:\n";
$bodyConfirm .= str_repeat('-', 40) . "\n";
$bodyConfirm .= "Name:    " . $fullName . "\n";
$bodyConfirm .= "Firma:   " . $company . "\n";
$bodyConfirm .= "E-Mail:  " . $email . "\n";
if ($formattedDate !== '') {
    $bodyConfirm .= "Wunschtermin: " . $formattedDate . "\n";
}
$bodyConfirm .= "\nIhre Nachricht:\n" . $message . "\n\n";
$bodyConfirm .= str_repeat('-', 40) . "\n\n";
$bodyConfirm .= "Alternativ koennen Sie uns direkt erreichen:\n";
$bodyConfirm .= "E-Mail:   kontakt@makenda.digital\n";
$bodyConfirm .= "Telefon:  +49 241 4126000\n";
$bodyConfirm .= "Termin:   https://outlook.office.com/book/Makenda1@makenda.digital/\n\n";
$bodyConfirm .= "Mit freundlichen Gruessen\n";
$bodyConfirm .= "Ihr Makenda-Team\n";
$bodyConfirm .= "https://makenda.digital\n";

$headersConfirm  = 'MIME-Version: 1.0' . "\r\n";
$headersConfirm .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$headersConfirm .= 'Content-Transfer-Encoding: 8bit' . "\r\n";
$headersConfirm .= 'From: Makenda <kontakt@' . SENDER_DOMAIN . '>' . "\r\n";
$headersConfirm .= 'Reply-To: Makenda <kontakt@' . SENDER_DOMAIN . '>' . "\r\n";
$headersConfirm .= 'X-Mailer: PHP/' . phpversion() . "\r\n";

// Bestätigung senden (Fehler hier nicht kritisch)
@mail($email, $subjectConfirm, $bodyConfirm, $headersConfirm);

// ─── Ergebnis ─────────────────────────────────────────────────────────────────
if ($sentAdmin) {
    redirect('success');
} else {
    @file_put_contents(
        __DIR__ . '/mail_error.log',
        date('Y-m-d H:i:s') . " mail() failed – from: " . $email . "\n",
        FILE_APPEND
    );
    redirect('error', 'E-Mail konnte nicht gesendet werden. Bitte kontaktieren Sie uns direkt: kontakt@makenda.digital');
}
