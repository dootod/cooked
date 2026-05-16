import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "Cooked <noreply@cooked.app>";

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY not set, skipping email to", opts.to);
    console.warn("[Email] Subject:", opts.subject);
    return;
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    console.error("[Email] Resend error:", error);
  } else {
    console.log("[Email] Sent to", opts.to, "id:", data?.id);
  }
}
