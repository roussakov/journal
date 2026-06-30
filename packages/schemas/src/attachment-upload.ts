import { z } from "zod";

export const attachmentKindSchema = z.enum(["image", "video", "audio"]);

const formUploadId = z.preprocess(
  (value) => (typeof value === "string" ? value : ""),
  z.string().trim().min(1, "uploadId is required"),
);

const formKind = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim().length > 0
      ? value.trim()
      : undefined,
  attachmentKindSchema.optional(),
);

/** Minimal file shape from multipart `file` field (browser File or equivalent). */
export type AttachmentUploadFile = {
  name: string;
  type: string;
  size: number;
};

function isUploadFile(value: unknown): value is AttachmentUploadFile {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    "type" in value &&
    "size" in value &&
    typeof value.name === "string" &&
    typeof value.type === "string" &&
    typeof value.size === "number" &&
    value.size > 0
  );
}

const formFile = z.preprocess(
  (value) => value,
  z.custom<AttachmentUploadFile>(isUploadFile, {
    message: "file is required",
  }),
);

/** Metadata fields for POST /api/entries/[id]/attachments. */
export const attachmentUploadInputSchema = z.object({
  uploadId: formUploadId,
  kind: formKind,
});

/** Full multipart body for POST /api/entries/[id]/attachments. */
export const attachmentUploadRequestSchema = attachmentUploadInputSchema.extend({
  file: formFile,
});

export type AttachmentKind = z.infer<typeof attachmentKindSchema>;
export type AttachmentUploadInput = z.infer<typeof attachmentUploadInputSchema>;
export type AttachmentUploadRequest = z.infer<
  typeof attachmentUploadRequestSchema
>;
