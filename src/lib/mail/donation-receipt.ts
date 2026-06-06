/**
 * Donation receipt email via Resend.
 * Sent automatically from the Paystack webhook after a charge.success event.
 */

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Home Masjid <noreply@homemasjid.org>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export interface DonationReceiptParams {
  to: string;
  donorName?: string;
  amountZar: number;
  projectTitle: string;
  masjidName: string;
  masjidId: string;
  reference: string;
  isRecurring: boolean;
  date: string;
}

export async function sendDonationReceipt(params: DonationReceiptParams) {
  const {
    to,
    donorName,
    amountZar,
    projectTitle,
    masjidName,
    masjidId,
    reference,
    isRecurring,
    date,
  } = params;

  const formattedAmount = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
  }).format(amountZar);

  const masjidUrl = `${SITE_URL}/masjids/${masjidId}`;
  const greeting = donorName ? `As-Salamu Alaykum, ${donorName}` : "As-Salamu Alaykum";
  const recurringNote = isRecurring
    ? `<p style="color:#64748B;font-size:14px;margin:0 0 16px;">
        🔄 <strong>Monthly Sadaqah Jariyah</strong> — this donation will recur on the same date each month.
        You will receive a receipt for each payment. To manage your subscription, contact us at
        <a href="mailto:support@homemasjid.org" style="color:#D4AF37;">support@homemasjid.org</a>.
      </p>`
    : "";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Donation Receipt — Home Masjid</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:#0F172A;padding:32px 40px;text-align:center;">
              <h1 style="color:#D4AF37;font-size:24px;margin:0;font-weight:700;letter-spacing:-0.5px;">
                🕌 Home Masjid
              </h1>
              <p style="color:#94A3B8;font-size:13px;margin:8px 0 0;">Your Home. Your Masjid. Connected.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#0F172A;font-size:20px;margin:0 0 8px;">JazakAllah Khayran 🤲</h2>
              <p style="color:#64748B;font-size:15px;margin:0 0 24px;">${greeting},</p>

              <p style="color:#334155;font-size:15px;line-height:1.6;margin:0 0 24px;">
                Your generous donation to <strong>${masjidName}</strong> has been received and confirmed. 
                May Allah accept it as a continuous blessing for you and your family.
              </p>

              ${recurringNote}

              <!-- Receipt Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:24px;margin:0 0 24px;">
                <tr>
                  <td>
                    <p style="color:#64748B;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 16px;font-weight:600;">
                      Donation Receipt
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#64748B;font-size:14px;padding:6px 0;">Project</td>
                        <td style="color:#0F172A;font-size:14px;font-weight:600;text-align:right;">${projectTitle}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B;font-size:14px;padding:6px 0;">Masjid</td>
                        <td style="color:#0F172A;font-size:14px;text-align:right;">${masjidName}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B;font-size:14px;padding:6px 0;">Amount</td>
                        <td style="color:#D4AF37;font-size:18px;font-weight:700;text-align:right;">${formattedAmount}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B;font-size:14px;padding:6px 0;">Type</td>
                        <td style="color:#0F172A;font-size:14px;text-align:right;">${isRecurring ? "Monthly Sadaqah Jariyah" : "One-time Gift"}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B;font-size:14px;padding:6px 0;">Date</td>
                        <td style="color:#0F172A;font-size:14px;text-align:right;">${date}</td>
                      </tr>
                      <tr>
                        <td style="color:#64748B;font-size:12px;padding:6px 0;">Reference</td>
                        <td style="color:#94A3B8;font-size:11px;font-family:monospace;text-align:right;">${reference}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="text-align:center;margin:32px 0 0;">
                <a href="${masjidUrl}" style="background:#D4AF37;color:#0F172A;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;display:inline-block;">
                  View Masjid Profile
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:24px 40px;border-top:1px solid #E2E8F0;text-align:center;">
              <p style="color:#94A3B8;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Home Masjid · 
                <a href="${SITE_URL}/privacy" style="color:#94A3B8;">Privacy</a> · 
                <a href="${SITE_URL}/terms" style="color:#94A3B8;">Terms</a>
              </p>
              <p style="color:#CBD5E1;font-size:11px;margin:8px 0 0;">
                This is an automated receipt. Please keep it for your records.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Donation Receipt — ${formattedAmount} to ${projectTitle} · Home Masjid`,
      html,
    });
  } catch (err) {
    // Receipt email failures should not break the webhook response
    console.error("Failed to send donation receipt email:", err);
  }
}
