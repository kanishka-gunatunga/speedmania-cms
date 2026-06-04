import { put } from "@vercel/blob";
import { NextResponse, NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided for upload." },
        { status: 400 }
      );
    }

    // Standardize file name by removing characters that aren't letters, numbers, dots, or hyphens
    const cleanFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

    // Put file to Vercel Blob
    const blob = await put(cleanFileName, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
    });
  } catch (error: any) {
    console.error("[API_UPLOAD_POST] Vercel Blob upload failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload file." },
      { status: 500 }
    );
  }
}
