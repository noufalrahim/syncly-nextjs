import { NextResponse } from "next/server";
import connectToDatabase from "@/infrastructure/db/mongodb";
import Document from "@/infrastructure/models/Document";
import { requireUser } from "@/infrastructure/auth/requireUser";

export async function GET(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const documents = await Document.find({ workspaceId });

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.error("Fetch documents error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, type, parentId, workspaceId, projectId, size } = await request.json();

    if (!name || !type || !workspaceId || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const document = await Document.create({
      name,
      type,
      parentId: parentId || null,
      workspaceId,
      projectId,
      size: size || "",
      ownerId: me.userId,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Create document error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const me = await requireUser();
    if (!me.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    await connectToDatabase();

    const toDelete = await Document.findById(documentId);
    if (!toDelete) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    async function deleteRecursively(id: string) {
      await Document.findByIdAndDelete(id);
      const children = await Document.find({ parentId: id });
      for (const child of children) {
        await deleteRecursively(child._id.toString());
      }
    }

    await deleteRecursively(documentId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
