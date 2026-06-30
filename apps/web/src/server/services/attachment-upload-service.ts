import "server-only";

import type { AttachmentKind, AttachmentUploadInput } from "@journal/schemas";
import { createRequestLogger } from "@/lib/logger";
import { entryRepository } from "@/server/repositories/entry-repository";
import { detectKindFromMime } from "@/server/services/attachments/detect-kind";
import { noopStorageProvider } from "@/server/services/attachments/storage/noop-provider";

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

export type AttachmentUploadFileInput = {
  fileName: string;
  mimeType: string;
  size: number;
};

export type AttachmentUploadSuccess = {
  status: "success";
  uploadId: string;
  fileName: string;
  kind: AttachmentKind;
};

export type AttachmentUploadFailure = {
  status: "error";
  uploadId: string;
  fileName: string;
  error: string;
};

export type AttachmentUploadResult =
  | AttachmentUploadSuccess
  | AttachmentUploadFailure;

export class AttachmentEntryNotFoundError extends Error {
  constructor(entryId: string) {
    super(`Entry not found: ${entryId}`);
    this.name = "AttachmentEntryNotFoundError";
  }
}

export class AttachmentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AttachmentValidationError";
  }
}

export async function upload(
  entryId: string,
  input: AttachmentUploadInput,
  file: AttachmentUploadFileInput,
): Promise<AttachmentUploadResult> {
  const log = createRequestLogger({
    entryId,
    uploadId: input.uploadId,
    fileName: file.fileName,
  });
  const startedAt = Date.now();

  log.info(
    {
      event: "attachment.upload.received",
      mimeType: file.mimeType,
      size: file.size,
    },
    "attachment upload received",
  );

  const entry = await entryRepository.getById(entryId);
  if (!entry) {
    log.error(
      {
        event: "attachment.upload.error",
        reason: "entry_not_found",
        durationMs: Date.now() - startedAt,
      },
      "attachment upload failed",
    );
    throw new AttachmentEntryNotFoundError(entryId);
  }

  const mimeType = file.mimeType.toLowerCase();

  if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
    const message = `Unsupported file type: ${file.mimeType}`;
    log.error(
      {
        event: "attachment.upload.error",
        reason: "invalid_mime",
        mimeType: file.mimeType,
        durationMs: Date.now() - startedAt,
      },
      "attachment upload failed",
    );
    throw new AttachmentValidationError(message);
  }

  const kind = detectKindFromMime(mimeType);
  if (!kind || kind !== "image") {
    const message = "Only image attachments are supported in MVP";
    log.error(
      {
        event: "attachment.upload.error",
        reason: "invalid_kind",
        mimeType: file.mimeType,
        durationMs: Date.now() - startedAt,
      },
      "attachment upload failed",
    );
    throw new AttachmentValidationError(message);
  }

  if (input.kind && input.kind !== kind) {
    const message = `Declared kind "${input.kind}" does not match file type`;
    log.error(
      {
        event: "attachment.upload.error",
        reason: "kind_mismatch",
        declaredKind: input.kind,
        detectedKind: kind,
        durationMs: Date.now() - startedAt,
      },
      "attachment upload failed",
    );
    throw new AttachmentValidationError(message);
  }

  try {
    await noopStorageProvider.store({
      entryId,
      fileName: file.fileName,
      mimeType,
      size: file.size,
    });

    log.info(
      {
        event: "attachment.upload.success",
        kind,
        durationMs: Date.now() - startedAt,
      },
      "attachment upload succeeded",
    );

    return {
      status: "success",
      uploadId: input.uploadId,
      fileName: file.fileName,
      kind,
    };
  } catch (error) {
    log.error(
      {
        event: "attachment.upload.error",
        reason: "storage_failed",
        durationMs: Date.now() - startedAt,
        err: error,
      },
      "attachment upload failed",
    );

    return {
      status: "error",
      uploadId: input.uploadId,
      fileName: file.fileName,
      error: "Upload failed",
    };
  }
}

export const attachmentUploadService = {
  upload,
};
