import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM ?? "Cooked <noreply@cooked.app>";

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  return `${local.slice(0, Math.min(3, local.length))}***@${domain}`;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[Email] RESEND_API_KEY not set, skipping email to",
        maskEmail(opts.to),
      );
      console.warn("[Email] Subject:", opts.subject);
    } else {
      console.warn("[Email] RESEND_API_KEY not set, skipping email");
    }
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[Email] Sending to",
      maskEmail(opts.to),
      "subject:",
      opts.subject,
    );
  } else {
    console.log("[Email] Sending email, subject:", opts.subject);
  }

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    console.error("[Email] Resend error:", error.name, error.message);
    throw new Error(`Email send failed: ${error.message}`);
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[Email] Sent to", maskEmail(opts.to), "id:", data?.id);
  } else {
    console.log("[Email] Sent, id:", data?.id);
  }
}
