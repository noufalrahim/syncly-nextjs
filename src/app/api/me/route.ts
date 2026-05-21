import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import User from "@/infrastructure/models/User";
import { getServerAuthSession } from "@/infrastructure/auth/getServerAuthSession";

export async function GET() {
  const session = await getServerAuthSession();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ user: null }, { status: 200 });

  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ user: null }, { status: 200 });

  return NextResponse.json(
    {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
      },
    },
    { status: 200 }
  );
}

