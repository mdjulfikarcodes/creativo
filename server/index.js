const http = require("http");
const { MongoClient, ObjectId } = require("mongodb");
const { jwtVerify, SignJWT } = require("jose");

const c = new MongoClient(process.env.MONGO_URI);
const db = c.db(process.env.DB_NAME || "creativo");
const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

function parseCookies(req) {
  return (req.headers.cookie || "").split(";").reduce((acc, pair) => {
    const [k, ...v] = pair.split("=");
    acc[k.trim()] = v.join("=").trim();
    return acc;
  }, {});
}

async function getToken(req) {
  const cookies = parseCookies(req);
  if (cookies.token) return cookies.token;
  return (req.headers.authorization || "").replace("Bearer ", "");
}

c.connect().then(() =>
  http
    .createServer(async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", CLIENT_ORIGIN);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }

      if (req.url === "/auth/login" && req.method === "POST") {
        let body = "";
        for await (const chunk of req) body += chunk;
        const token = await new SignJWT({ email: (JSON.parse(body || "{}")).email })
          .setProtectedHeader({ alg: "HS256", typ: "JWT" })
          .setExpirationTime("7d")
          .sign(secret);
        res.setHeader("Set-Cookie", `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`);
        res.writeHead(200).end(JSON.stringify({ ok: true }));
        return;
      }
      if (req.url === "/auth/logout" && req.method === "POST") {
        res.setHeader("Set-Cookie", "token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
        res.writeHead(200).end(JSON.stringify({ ok: true }));
        return;
      }

      const m = req.url?.match(/^\/booking\/([^/]+)\/review$/);
      if (!m || req.method !== "POST") { res.writeHead(404); res.end(); return; }
      const token = await getToken(req);
      if (!token) { res.writeHead(401); res.end(JSON.stringify({ error: "unauthorized" })); return; }
      try { await jwtVerify(token, secret); } catch { res.writeHead(401); res.end(JSON.stringify({ error: "invalid token" })); return; }
      let body = "";
      for await (const chunk of req) body += chunk;
      const { rating, comment } = JSON.parse(body || "{}");
      try {
        const booking = await db.collection("bookings").findOneAndUpdate(
          { _id: new ObjectId(m[1]) },
          { $set: { review: { rating: Number(rating), comment, createdAt: new Date() } } },
          { returnDocument: "after" }
        );
        if (!booking.value) { res.writeHead(404); res.end(JSON.stringify({ error: "booking not found" })); return; }
        const studioId = booking.value.studioId;
        const oid = typeof studioId === "string" ? new ObjectId(studioId) : studioId;
        const all = await db.collection("bookings").find({ studioId: oid, "review.rating": { $exists: true } }).toArray();
        const avg = all.reduce((s, b) => s + (b.review?.rating || 0), 0) / all.length;
        await db.collection("studios").findOneAndUpdate(
          { _id: oid },
          { $set: { rating: Math.round(avg * 10) / 10, reviews: all.length } }
        );
        res.writeHead(200); res.end(JSON.stringify({ ok: true, rating: avg, reviews: all.length }));
      } catch (e) { res.writeHead(500); res.end(JSON.stringify({ error: e.message })); }
    })
    .listen(process.env.PORT || 5000, () => console.log("server on 5000"))
);
