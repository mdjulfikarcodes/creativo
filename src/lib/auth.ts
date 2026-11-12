import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGO_URI as string);
const db = client.db("creativo");

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  
  trustedOrigins: [
    "http://localhost:3000",
    "https://creativo-frontend-one.vercel.app"
  ],

  emailAndPassword: { 
    enabled: true,
    minPasswordLength: 6,
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  
  user: {
    additionalFields: {
      image: {
        type: "string",
        required: false,
      },
    },
  },

  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
    },
  },

  plugins: [jwt()],
});