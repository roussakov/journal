import "server-only";

import { auth } from "@clerk/nextjs/server";
import { forbidden } from "next/navigation";
import { userIsAdmin } from "@/auth/admin";

/** Gate SSR pages — redirects unsigned users, 403 for non-admin. */
export async function guardAdminPage(): Promise<void> {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn();
  }

  if (!(await userIsAdmin(userId, sessionClaims))) {
    forbidden();
  }
}
