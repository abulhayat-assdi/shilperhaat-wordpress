import { NextRequest, NextResponse } from "next/server";
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import path from "path";

// Serves files from public/uploads at runtime. The production server only
// serves public/ assets that existed at startup, so files uploaded while the
// app is running would 404 until the next restart without this route.

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;

  if (
    !segments?.length ||
    segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\") || s.includes("\0"))
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const filePath = path.join(UPLOADS_DIR, ...segments);
  if (!filePath.startsWith(UPLOADS_DIR + path.sep)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let fileStat;
  try {
    fileStat = await stat(filePath);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!fileStat.isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const contentType =
    CONTENT_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";

  const baseHeaders = {
    "Content-Type": contentType,
    // Upload filenames are unique (timestamp + random suffix), so content
    // at a given URL never changes and can be cached forever.
    "Cache-Control": "public, max-age=31536000, immutable",
    "Accept-Ranges": "bytes",
  };

  // Range support so video seeking works
  const range = req.headers.get("range");
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (match) {
      const start = match[1] ? parseInt(match[1], 10) : 0;
      const end = match[2] ? Math.min(parseInt(match[2], 10), fileStat.size - 1) : fileStat.size - 1;
      if (start > end || start >= fileStat.size) {
        return new NextResponse(null, {
          status: 416,
          headers: { "Content-Range": `bytes */${fileStat.size}` },
        });
      }
      const stream = Readable.toWeb(
        createReadStream(filePath, { start, end })
      ) as ReadableStream;
      return new NextResponse(stream, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes ${start}-${end}/${fileStat.size}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }
  }

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;
  return new NextResponse(stream, {
    status: 200,
    headers: { ...baseHeaders, "Content-Length": String(fileStat.size) },
  });
}
