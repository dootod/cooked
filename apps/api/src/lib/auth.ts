import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { db, user, session, account, verification } from "@cooked/db";
import { sendEmail } from "./email.js";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET env var is required");
}

const APP_URL = process.env.CORS_ORIGIN ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user: u, url }) => {
      await sendEmail({
        to: u.email,
        subject: "Reinitialiser votre mot de passe — Cooked",
        html: `
          <h2>Reinitialisation de mot de passe</h2>
          <p>Bonjour ${u.name},</p>
          <p>Cliquez sur le lien ci-dessous pour reinitialiser votre mot de passe :</p>
          <p><a href="${url}">Reinitialiser mon mot de passe</a></p>
          <p>Ce lien expire dans 1 heure.</p>
          <p>Si vous n'avez pas demande cette reinitialisation, ignorez cet email.</p>
        `,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user: u, url }) => {
      await sendEmail({
        to: u.email,
        subject: "Verifiez votre email — Cooked",
        html: `
          <h2>Bienvenue sur Cooked !</h2>
          <p>Bonjour ${u.name},</p>
          <p>Cliquez sur le lien ci-dessous pour verifier votre adresse email :</p>
          <p><a href="${url}">Verifier mon email</a></p>
          <p>Ce lien expire dans 24 heures.</p>
        `,
      });
    },
  },
  plugins: [admin()],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
  trustedOrigins: (process.env.CORS_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim()),
});
