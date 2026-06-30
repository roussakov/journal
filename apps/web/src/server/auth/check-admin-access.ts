import "server-only";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { userIsAdmin } from "@/auth/admin";

/** Returns a 401/403 response when access is denied; `null` when the handler may proceed. */
export async function checkAdminAccess() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await userIsAdmin(userId, sessionClaims))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}
