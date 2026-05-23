import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Body = z.object({
  email: z.string().email().max(254),
  source: z.string().max(64).optional(),
});

export async function POST(req: Request) {
  let parsed;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json(
      { error: "Please enter a valid email." },
      { status: 400 },
    );
  }

  const ua = req.headers.get("user-agent")?.slice(0, 512) ?? null;
  const referrer = req.headers.get("referer")?.slice(0, 512) ?? null;

  try {
    const db = sql();
    const rows = await db<{ id: number }[]>`
      INSERT INTO waitlist (email, source, referrer, user_agent)
      VALUES (${parsed.email.toLowerCase()}, ${parsed.source ?? "home"}, ${referrer}, ${ua})
      ON CONFLICT (email) DO UPDATE
        SET source = EXCLUDED.source
      RETURNING id
    `;
    return NextResponse.json({ ok: true, id: rows[0]?.id ?? null });
  } catch (err) {
    console.error("[waitlist] insert failed", err);
    return NextResponse.json(
      { error: "Could not save your email right now. Try again in a moment." },
      { status: 500 },
    );
  }
}
