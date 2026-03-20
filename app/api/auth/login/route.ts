import { NextResponse } from "next/server";

import {
  getExpectedCredentials,
  safeCompareStrings,
} from "@/lib/auth-credentials";
import { COOKIE_NAME, isAuthConfigured, signSession } from "@/lib/auth-session";

export async function POST(request: Request) {
  if (!isAuthConfigured()) {
    return NextResponse.json(
      { error: "Authentication is not configured on the server." },
      { status: 503 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username : "";
  const password = typeof body.password === "string" ? body.password : "";

  const expected = getExpectedCredentials();
  const userOk = safeCompareStrings(username, expected.username);
  const passOk = safeCompareStrings(password, expected.password);

  if (!userOk || !passOk) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  const token = await signSession(username);
  if (!token) {
    return NextResponse.json(
      { error: "Could not create session." },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
