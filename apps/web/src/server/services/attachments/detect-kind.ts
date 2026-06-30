import type { AttachmentKind } from "@journal/schemas";

const MIME_TO_KIND: Record<string, AttachmentKind> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/heic": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "audio/mpeg": "audio",
  "audio/mp4": "audio",
  "audio/wav": "audio",
};

export function detectKindFromMime(mimeType: string): AttachmentKind | null {
  return MIME_TO_KIND[mimeType.toLowerCase()] ?? null;
}
