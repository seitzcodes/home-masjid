import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'Home Masjid <hello@homemasjid.co.za>';

export async function sendClaimApprovalEmail(to: string, masjidName: string) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Your claim for ${masjidName} has been approved!`,
      html: `
        <div>
          <h2>Congratulations!</h2>
          <p>Your request to verify and manage <strong>${masjidName}</strong> on Home Masjid has been approved.</p>
          <p>You can now log in to your dashboard to manage the masjid profile, post updates, and schedule programs.</p>
          <a href="https://homemasjid.co.za/dashboard" style="display:inline-block;padding:10px 20px;background-color:#16a34a;color:white;text-decoration:none;border-radius:5px;margin-top:10px;">Go to Dashboard</a>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

export async function sendClaimRejectionEmail(to: string, masjidName: string) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Update on your claim for ${masjidName}`,
      html: `
        <div>
          <h2>Claim Update</h2>
          <p>Thank you for your interest in managing <strong>${masjidName}</strong> on Home Masjid.</p>
          <p>Unfortunately, we could not verify your claim at this time. If you believe this was in error, please reply to this email with additional proof of your role.</p>
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}
