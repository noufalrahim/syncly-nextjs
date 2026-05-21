import { getServerAuthSession } from "@/infrastructure/auth/getServerAuthSession";

export async function requireUser() {
  const session = await getServerAuthSession();
  const userId = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email || undefined;
  if (!userId || !email) {
    return { ok: false as const };
  }
  return { ok: true as const, userId, email };
}

