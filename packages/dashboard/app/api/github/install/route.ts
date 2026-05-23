import { NextResponse } from "next/server";
import { installUrl } from "@/lib/github";

// Send the user to GitHub to install the App on the org/account whose repos they
// want Pheme to see. GitHub returns them to the install callback below.
export async function GET() {
  return NextResponse.redirect(installUrl());
}
