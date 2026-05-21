import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "@/infrastructure/db/mongodb";
import User from "@/infrastructure/models/User";

function optionalEnv(name: string) {
  const value = process.env[name];
  return value && value.length ? value : undefined;
}

const googleClientId = optionalEnv("GOOGLE_CLIENT_ID");
const googleClientSecret = optionalEnv("GOOGLE_CLIENT_SECRET");

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;
        await connectToDatabase();
        const user = await User.findOne({ email: String(email).toLowerCase() });
        if (!user) return null;
        if (!user.password || user.password !== password) return null;
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      await connectToDatabase();

      const existing = await User.findOne({ email: user.email });
      if (!existing) {
        await User.create({
          name: user.name || user.email.split("@")[0],
          email: user.email,
          image: user.image,
          provider: account?.provider || "google",
          providerAccountId: account?.providerAccountId,
        });
      } else {
        await User.updateOne(
          { _id: existing._id },
          {
            $set: {
              name: existing.name || user.name,
              image: user.image,
              provider: account?.provider || existing.provider,
              providerAccountId:
                account?.providerAccountId || existing.providerAccountId,
            },
          }
        );
      }
      return true;
    },
    async jwt({ token }) {
      if (!token.email) return token;
      await connectToDatabase();
      const dbUser = await User.findOne({ email: token.email });
      if (dbUser) token.id = dbUser._id.toString();
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) (session.user as any).id = token.id as string;
      return session;
    },
  },
};
