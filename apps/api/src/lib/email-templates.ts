const COLORS = {
  primary: "#475B8A",
  primaryLight: "#EEF1F7",
  accent: "#FF8C69",
  bg: "#F6F8FF",
  text: "#1A1A2E",
  textSecondary: "#6B7A99",
  border: "#BEC8DC",
  white: "#FFFFFF",
};

function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cooked</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.bg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:${COLORS.white};border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(71,91,138,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${COLORS.primary} 0%,#3A4E78 100%);padding:32px 40px;text-align:center;">
              <span style="font-size:28px;font-weight:700;color:${COLORS.white};font-family:Georgia,serif;letter-spacing:-0.5px;">Cooked<span style="color:${COLORS.accent};">.</span></span>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 40px 32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:0 40px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-top:1px solid ${COLORS.border};padding-top:24px;">
                    <p style="margin:0;font-size:12px;color:${COLORS.textSecondary};text-align:center;line-height:1.5;">
                      Cet email a ete envoye par Cooked.<br/>
                      Si vous n'avez pas effectue cette action, ignorez cet email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function button(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
  <tr>
    <td align="center" style="background-color:${COLORS.primary};border-radius:12px;">
      <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:${COLORS.white};text-decoration:none;border-radius:12px;">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

export function verificationEmail(name: string, url: string): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${COLORS.text};font-family:Georgia,serif;">
      Bienvenue sur Cooked !
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${COLORS.textSecondary};line-height:1.6;">
      Bonjour ${name}, merci de vous etre inscrit. Verifiez votre adresse email pour activer votre compte.
    </p>
    ${button(url, "Verifier mon email")}
    <p style="margin:0;font-size:13px;color:${COLORS.textSecondary};line-height:1.5;">
      Ce lien expire dans 24 heures. Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
    </p>
    <p style="margin:8px 0 0;font-size:12px;color:${COLORS.primary};word-break:break-all;">
      ${url}
    </p>
  `);
}

export function resetPasswordEmail(name: string, url: string): string {
  return layout(`
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${COLORS.text};font-family:Georgia,serif;">
      Reinitialisation de mot de passe
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${COLORS.textSecondary};line-height:1.6;">
      Bonjour ${name}, vous avez demande a reinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
    </p>
    ${button(url, "Reinitialiser mon mot de passe")}
    <p style="margin:0;font-size:13px;color:${COLORS.textSecondary};line-height:1.5;">
      Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez simplement cet email.
    </p>
    <p style="margin:8px 0 0;font-size:12px;color:${COLORS.primary};word-break:break-all;">
      ${url}
    </p>
  `);
}
