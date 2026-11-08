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

      if (req.url?.startsWith("/studio") && req.method === "GET") {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const query = {};
        if (url.searchParams.get("location")) query.location = { $regex: url.searchParams.get("location"), $options: "i" };
        if (url.searchParams.get("minPrice") || url.searchParams.get("maxPrice")) {
          query.hourlyRate = {};
          if (url.searchParams.get("minPrice")) query.hourlyRate.$gte = Number(url.searchParams.get("minPrice"));
          if (url.searchParams.get("maxPrice")) query.hourlyRate.$lte = Number(url.searchParams.get("maxPrice"));
        }
        if (url.searchParams.get("minCapacity") || url.searchParams.get("maxCapacity")) {
          query.maxCapacity = {};
          if (url.searchParams.get("minCapacity")) query.maxCapacity.$gte = Number(url.searchParams.get("minCapacity"));
          if (url.searchParams.get("maxCapacity")) query.maxCapacity.$lte = Number(url.searchParams.get("maxCapacity"));
        }
        if (url.searchParams.get("category")) {
          query.category = { $regex: url.searchParams.get("category"), $options: "i" };
        }
        query.deletedAt = { $exists: false };
        const studios = await db.collection("studios").find(query).toArray();
        res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(studios));
        return;
      }

      if (req.url === "/wishlist" && req.method === "GET") {
        const token = await getToken(req);
        if (!token) { res.writeHead(401).end(JSON.stringify({ error: "unauthorized" })); return; }
        try { await jwtVerify(token, secret); } catch { res.writeHead(401).end(JSON.stringify({ error: "invalid token" })); return; }
        const email = (await jwtVerify(token, secret)).payload.email;
        const wishes = await db.collection("wishlists").find({ userId: email }).toArray();
        console.log("[wishlist GET] wishes:", JSON.stringify(wishes));
        const ids = wishes.map(w => new ObjectId(w.studioId));
        const studios = ids.length ? await db.collection("studios").find({ _id: { $in: ids } }).toArray() : [];
        console.log("[wishlist GET] studios:", JSON.stringify(studios.map(s => ({ _id: s._id, title: s.title }))));
        res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(studios));
        return;
      }
      if (req.url === "/wishlist" && req.method === "POST") {
        const token = await getToken(req);
        if (!token) { res.writeHead(401).end(JSON.stringify({ error: "unauthorized" })); return; }
        try { await jwtVerify(token, secret); } catch { res.writeHead(401).end(JSON.stringify({ error: "invalid token" })); return; }
        const email = (await jwtVerify(token, secret)).payload.email;
        let body = "";
        for await (const chunk of req) body += chunk;
        const { studioId } = JSON.parse(body || "{}");
        console.log("[wishlist POST] studioId:", studioId, "user:", email);
        await db.collection("wishlists").updateOne({ userId: email, studioId }, { $set: { userId, studioId, createdAt: new Date() } }, { upsert: true });
        res.writeHead(200).end(JSON.stringify({ ok: true }));
        return;
      }
      if (req.url?.startsWith("/wishlist/") && req.method === "GET") {
        const token = await getToken(req);
        if (!token) { res.writeHead(401).end(JSON.stringify({ error: "unauthorized" })); return; }
        try { await jwtVerify(token, secret); } catch { res.writeHead(401).end(JSON.stringify({ error: "invalid token" })); return; }
        const email = (await jwtVerify(token, secret)).payload.email;
        const studioId = req.url.split("/wishlist/")[1];
        const wish = await db.collection("wishlists").findOne({ userId: email, studioId });
        console.log("[wishlist check] studioId:", studioId, "wishlisted:", !!wish);
        res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ wishlisted: !!wish }));
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
