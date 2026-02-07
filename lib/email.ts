import { Resend } from 'resend';

// Lazy initialization to avoid build errors
let resend: Resend | null = null;

function getResend(): Resend {
  if (!resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === 'your_resend_api_key_here') {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resend = new Resend(apiKey);
  }
  return resend;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    const client = getResend();
    const data = await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'WeDate <noreply@yourdomain.com>',
      to: [to],
      subject,
      html,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Resend email error:', error);
    throw error;
  }
}

/**
 * Generate a 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send verification email with code
 */
export async function sendVerificationEmail(
  email: string,
  code: string,
  name?: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <tr>
                  <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold; text-align: center;">
                      💕 WeDate
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px; font-weight: 600;">
                      ${name ? `Hi ${name}!` : 'Welcome!'}
                    </h2>
                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      Thanks for signing up for WeDate! To complete your registration, please verify your email address using the code below:
                    </p>
                    
                    <!-- Verification Code -->
                    <div style="background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
                      <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                        Verification Code
                      </p>
                      <p style="margin: 0; color: #111827; font-size: 36px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${code}
                      </p>
                    </div>
                    
                    <p style="margin: 24px 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                      This code will expire in <strong>10 minutes</strong>. If you didn't request this code, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 40px; background: #f9fafb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center; line-height: 1.5;">
                      © ${new Date().getFullYear()} WeDate. All rights reserved.<br>
                      If you have any questions, please contact us at support@wedate.com
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Verify your WeDate email',
    html,
  });
}

/**
 * Send welcome email after verification
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to WeDate!</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f9fafb;">
        <table role="presentation" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table role="presentation" style="width: 600px; border-collapse: collapse; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="padding: 40px 40px 20px; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); border-radius: 16px 16px 0 0;">
                    <h1 style="margin: 0; color: white; font-size: 32px; font-weight: bold; text-align: center;">
                      🎉 Welcome to WeDate!
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="margin: 0 0 16px; color: #111827; font-size: 24px;">Hi ${name}!</h2>
                    <p style="margin: 0 0 16px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      Your email has been verified successfully! You're all set to start meeting amazing people.
                    </p>
                    <p style="margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.5;">
                      Here are some tips to get started:
                    </p>
                    <ul style="color: #4b5563; font-size: 16px; line-height: 2;">
                      <li>Add 2-9 photos to your profile</li>
                      <li>Complete your bio and prompts</li>
                      <li>Select your interests</li>
                      <li>Start swiping to find matches!</li>
                    </ul>
                    <div style="text-align: center; margin: 32px 0;">
                      <a href="${process.env.NEXT_PUBLIC_APP_URL}/swipe" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #ec4899 0%, #a855f7 100%); color: white; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
                        Start Swiping
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 40px; background: #f9fafb; border-radius: 0 0 16px 16px; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                      © ${new Date().getFullYear()} WeDate. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Welcome to WeDate! 💕',
    html,
  });
}
