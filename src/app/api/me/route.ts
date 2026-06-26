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
        theme: user.theme || "dark",
        token: user.token || "",
      },
    },
    { status: 200 }
  );
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerAuthSession();
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { theme } = await request.json();
    if (!theme) return NextResponse.json({ error: "Missing theme" }, { status: 400 });

    await connectToDatabase();
    const user = await User.findOneAndUpdate(
      { email },
      { $set: { theme } },
      { new: true }
    );

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          theme: user.theme,
          token: user.token,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update theme error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

