/**
 * Minimal email helper for the Dr. Kent backend.
 *
 * Sending email is OPTIONAL. It only runs when SMTP / transactional email
 * env vars are configured. If nothing is configured, `sendContactEmail`
 * resolves successfully without doing anything, so contact submissions are
 * never blocked by missing email setup.
 *
 * Supported (in order of preference):
 *   1. RESEND_API_KEY  -> uses Resend's HTTP API (no extra dependency).
 *   2. SMTP_HOST + SMTP_USER + SMTP_PASS -> uses nodemailer IF installed.
 *   3. Neither -> no-op.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Send an email via Resend's REST API.
 * @returns {Promise<boolean>} true if sent
 */
async function sendViaResend({ to, subject, text }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return false;

    const from = process.env.EMAIL_FROM || "Dr. Kent <onboarding@resend.dev>";

    const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to, subject, text }),
    });

    return res.ok;
}

/**
 * Send an email via nodemailer (SMTP) if nodemailer is installed.
 * @returns {Promise<boolean>} true if sent
 */
async function sendViaSmtp({ to, subject, text }) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return false;

    let nodemailer;
    try {
        // eslint-disable-next-line import/no-extraneous-dependencies
        nodemailer = (await import("nodemailer")).default;
    } catch {
        // nodemailer not installed — skip SMTP path
        return false;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        text,
    });

    return true;
}

/**
 * Send a contact-notification email to the configured inbox.
 * Resolves gracefully (no throw) when email is not configured.
 */
export async function sendContactEmail({ contact }) {
    const adminInbox = process.env.CONTACT_INBOX_EMAIL || process.env.EMAIL_TO;
    if (!adminInbox) return false;

    const subject = `New Contact Inquiry: ${contact?.subject || "Website contact"}`;
    const text = [
        `New inquiry received from the Dr. Kent website.`,
        ``,
        `Name: ${contact?.fullName || "-"}`,
        `Email: ${contact?.email || "-"}`,
        `Phone: ${contact?.phoneNumber || "-"}`,
        `Inquiry Type: ${contact?.inquiryType || "General Inquiry"}`,
        `Subject: ${contact?.subject || "-"}`,
        ``,
        `Message:`,
        `${contact?.message || "-"}`,
    ].join("\n");

    // Try Resend first, then SMTP.
    let sent = false;
    try {
        sent = await sendViaResend({ to: adminInbox, subject, text });
    } catch (err) {
        console.error("Resend email failed:", err?.message || err);
    }

    if (!sent) {
        try {
            sent = await sendViaSmtp({ to: adminInbox, subject, text });
        } catch (err) {
            console.error("SMTP email failed:", err?.message || err);
        }
    }

    // Small delay not needed; keep function deterministic.
    return sent;
}
