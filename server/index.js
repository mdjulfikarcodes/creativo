const http = require("http");
const { MongoClient, ObjectId } = require("mongodb");
const { jwtVerify } = require("jose");

const c = new MongoClient(process.env.MONGO_URI);
const db = c.db(process.env.DB_NAME || "creativo");
const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);

c.connect().then(() =>
  http
    .createServer(async (req, res) => {
      res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_ORIGIN || "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      if (req.method === "OPTIONS") { res.writeHead(204); res.end(); return; }
      const m = req.url?.match(/^\/booking\/([^/]+)\/review$/);
      if (!m || req.method !== "POST") { res.writeHead(404); res.end(); return; }
      const token = (req.headers.authorization || "").replace("Bearer ", "");
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
