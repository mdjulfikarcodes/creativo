// lib/mongodb.ts
import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGO_URI;

if (!uri) {
  throw new Error("❌ MONGO_URI is missing in .env file");
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getDb(): Promise<Db> {
  const connected = await clientPromise;
  return connected.db(process.env.DB_NAME || "creativo");
}

export default clientPromise;