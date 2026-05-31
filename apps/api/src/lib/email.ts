import { env } from './env';

type EmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

/**
 * Send transactional email. In local/dev without a provider, log the message so
 * account flows remain testable without paid infrastructure.
 */
export async function sendEmail(input: EmailInput): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.info('[email:dev]', {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => 'Email provider error');
    throw new Error(`Email send failed: ${message}`);
  }
}
