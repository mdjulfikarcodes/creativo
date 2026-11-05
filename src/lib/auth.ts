// lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";
import { bearer, jwt } from "better-auth/plugins";
import { SignJWT } from "jose";

const mongoUri = process.env.MONGO_URI;
const authSecret = process.env.BETTER_AUTH_SECRET;

if (!mongoUri) throw new Error("❌ MONGO_URI is missing");
if (!authSecret) throw new Error("❌ BETTER_AUTH_SECRET is missing");

const client = new MongoClient(mongoUri);
const db = client.db(process.env.DB_NAME || "creativo");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: authSecret,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    autoSignIn: true,
    minPasswordLength: 8,
    maxPasswordLength: 72,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    bearer(),
    jwt({
      // A custom signer requires `remoteUrl` to be set. It is only used for
      // discovery; tokens are signed below with the shared HS256 secret, so the
      // local JWKS endpoint is not used.
      jwks: {
        remoteUrl: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/api/auth/jwks`,
        // Required by better-auth when `remoteUrl` is set. It is only used to
        // describe the OpenID discovery metadata; no local key pair is minted
        // because signing is delegated to the custom HS256 signer below.
        keyPairConfig: { alg: "EdDSA" },
      },
      jwt: {
        // The Express API verifies these tokens with jsonwebtoken using
        // BETTER_AUTH_SECRET and the HS256 algorithm.
        sign: (payload, header) =>
          new SignJWT(payload)
            .setProtectedHeader({ ...header, alg: "HS256", typ: "JWT" })
            .sign(new TextEncoder().encode(authSecret)),
      },
    }),
  ],
  user: {
    additionalFields: {
      photoUrl: { type: "string", required: false, defaultValue: "", input: true },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.CLIENT_ORIGIN,
  ].filter((o): o is string => Boolean(o)),
});

export type Auth = typeof auth;
