import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, twoFactor } from "better-auth/plugins";
import { db, user, session, account, verification, twoFactor as twoFactorTable } from "@cooked/db";
import { sendEmail } from "./email.js";
import { verificationEmail, resetPasswordEmail } from "./email-templates.js";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET env var is required");
}

const APP_URL = process.env.CORS_ORIGIN ?? "http://localhost:3000";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3001",
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification, twoFactor: twoFactorTable },
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user: u, url }) => {
      try {
        await sendEmail({
          to: u.email,
          subject: "Reinitialiser votre mot de passe — Cooked",
          html: resetPasswordEmail(u.name, url),
        });
      } catch (err) {
        console.error("[Auth] Failed to send reset password email:", err);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user: u, url }) => {
      try {
        await sendEmail({
          to: u.email,
          subject: "Verifiez votre email — Cooked",
          html: verificationEmail(u.name, url),
        });
      } catch (err) {
        console.error("[Auth] Failed to send verification email:", err);
      }
    },
  },
  plugins: [
    admin(),
    twoFactor({
      issuer: "Cooked",
    }),
  ],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const name = (user.name ?? "").trim();
          if (name.length === 0) throw new Error("Nom requis");
          if (name.length > 100) throw new Error("Nom trop long (100 caracteres max)");
          return { data: { ...user, name } };
        },
      },
      update: {
        before: async (user) => {
          if (user.name !== undefined) {
            const name = (user.name as string).trim();
            if (name.length === 0) throw new Error("Nom requis");
            if (name.length > 100) throw new Error("Nom trop long (100 caracteres max)");
            return { data: { ...user, name } };
          }
          return { data: user };
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
    expiresIn: 60 * 60 * 24 * 3,
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
