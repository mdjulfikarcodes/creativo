// lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

if (!process.env.MONGO_URI) {
  throw new Error("❌ MONGO_URI is missing in .env file");
}
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("❌ BETTER_AUTH_SECRET is missing in .env file");
}

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db(process.env.DB_NAME || "creativo");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 72,
  },
  user: {
    additionalFields: {
      photoUrl: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    process.env.CLIENT_ORIGIN,
  ].filter((o): o is string => Boolean(o)),
});

// auth টাইপ অন্য জায়গায় ব্যবহারের জন্য export
export type Auth = typeof auth;