import { attachmentUploadRequestSchema } from "@journal/schemas";
import { NextResponse } from "next/server";
import { checkAdminAccess } from "@/server/auth/check-admin-access";
import { InvalidEntryIdError } from "@/server/repositories/entry-repository";
import {
  AttachmentEntryNotFoundError,
  AttachmentValidationError,
  attachmentUploadService,
} from "@/server/services/attachment-upload-service";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const denied = await checkAdminAccess();
  if (denied) return denied;

  const formData = await request.formData();
  const parsed = attachmentUploadRequestSchema.safeParse({
    uploadId: formData.get("uploadId"),
    kind: formData.get("kind"),
    file: formData.get("file"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 },
    );
  }

  const { file, ...input } = parsed.data;
  const { id } = await params;

  try {
    const result = await attachmentUploadService.upload(id, input, {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (
      error instanceof InvalidEntryIdError ||
      error instanceof AttachmentEntryNotFoundError
    ) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }
    if (error instanceof AttachmentValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }
}
