import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { getAdminSession } from "@/lib/auth";

export const maxDuration = 60;

const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
const ALLOWED_VIDEO_MIME = ["video/mp4", "video/webm", "video/quicktime"];
const ALLOWED_VIDEO_EXT = ["mp4", "webm", "mov"];

const IMAGE_MAX = 15 * 1024 * 1024;  // 15 MB
const VIDEO_MAX = 200 * 1024 * 1024; // 200 MB

export async function POST(req: NextRequest) {
  // Admin-only: reject if not logged in
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "misc";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const originalExt = (file.name.split(".").pop() || "").toLowerCase();
    const isImage = ALLOWED_IMAGE_MIME.includes(file.type) && ALLOWED_IMAGE_EXT.includes(originalExt);
    const isVideo = ALLOWED_VIDEO_MIME.includes(file.type) && ALLOWED_VIDEO_EXT.includes(originalExt);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only image (JPG, PNG, WebP, GIF) or video (MP4, WebM, MOV) files are allowed" },
        { status: 400 }
      );
    }

    if (isImage && file.size > IMAGE_MAX) {
      return NextResponse.json({ error: "Image size must be under 15MB" }, { status: 400 });
    }

    if (isVideo && file.size > VIDEO_MAX) {
      return NextResponse.json(
        { error: "Video file must be under 200MB. Please use YouTube link instead." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });

    if (isImage) {
      // Convert all images to WebP, cap dimensions, and compress.
      // rotate() bakes in EXIF orientation, which WebP conversion would otherwise drop.
      const filename = `${uniqueSuffix}.webp`;
      const optimized = await sharp(buffer)
        .rotate()
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();

      await writeFile(path.join(uploadDir, filename), optimized);
      return NextResponse.json({ success: true, url: `/uploads/${folder}/${filename}` });
    } else {
      // Video: save as-is
      const filename = `${uniqueSuffix}.${originalExt}`;
      await writeFile(path.join(uploadDir, filename), buffer);
      return NextResponse.json({ success: true, url: `/uploads/${folder}/${filename}` });
    }
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    const isPermissionError = message.includes("EACCES") || message.includes("permission denied");
    return NextResponse.json(
      { error: isPermissionError ? "সার্ভারে ফাইল লেখার অনুমতি নেই। Admin-কে জানান।" : message },
      { status: 500 }
    );
  }
}
