import { clerkClient } from "@clerk/nextjs/server";
import { isAdminRole } from "@/auth/roles";

export async function userHasAdminRole(userId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return isAdminRole(user.publicMetadata.role);
}

/** Session claims first, Clerk API fallback — shared by route guards when added. */
export async function userIsAdmin(
  userId: string,
  sessionClaims: CustomJwtSessionClaims | null | undefined,
): Promise<boolean> {
  if (isAdminRole(sessionClaims?.metadata?.role)) {
    return true;
  }

  return userHasAdminRole(userId);
}
