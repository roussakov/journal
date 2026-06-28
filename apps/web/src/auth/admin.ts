import { clerkClient } from "@clerk/nextjs/server";
import { isAdminRole } from "@/auth/roles";

export async function userHasAdminRole(userId: string): Promise<boolean> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return isAdminRole(user.publicMetadata.role);
}
