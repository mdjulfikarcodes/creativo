// ./src/app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.CLIENT_ORIGIN,
].filter((origin): origin is string => Boolean(origin));

function withCors(handler: (request: Request) => Promise<Response>) {
  return async (request: Request) => {
    const response = await handler(request);
    const origin = request.headers.get("origin");
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Expose-Headers",
        "set-auth-token, set-auth-jwt", // ✅ দুটোই
      );
    }
    return response;
  };
}

export const GET = withCors(handlers.GET);
export const POST = withCors(handlers.POST);

export function OPTIONS(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Expose-Headers": "set-auth-token, set-auth-jwt", // ✅ দুটোই
    },
  });
}