import { getServerSession } from "next-auth";
import { authOptions } from "@/infrastructure/auth/authOptions";

export function getServerAuthSession() {
  return getServerSession(authOptions);
}

