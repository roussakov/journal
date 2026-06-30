"use client";

import type { AttachmentKind } from "@journal/schemas";
import { useCallback, useState } from "react";

export type UploadItemStatus = "idle" | "uploading" | "success" | "error";

export type UploadItem = {
  uploadId: string;
  file: File;
  fileName: string;
  status: UploadItemStatus;
  kind?: AttachmentKind;
  error?: string;
};

const UPLOAD_CONCURRENCY = 3;

async function runWithConcurrency(
  tasks: Array<() => Promise<void>>,
  limit: number,
): Promise<void> {
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const taskIndex = index++;
      await tasks[taskIndex]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, () => worker()),
  );
}

export function useAttachmentUpload(entryId: string) {
  const [items, setItems] = useState<UploadItem[]>([]);

  const updateItem = useCallback(
    (uploadId: string, patch: Partial<UploadItem>) => {
      setItems((current) =>
        current.map((item) =>
          item.uploadId === uploadId ? { ...item, ...patch } : item,
        ),
      );
    },
    [],
  );

  const uploadFile = useCallback(
    async (item: UploadItem) => {
      updateItem(item.uploadId, {
        status: "uploading",
        error: undefined,
      });

      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("uploadId", item.uploadId);

      try {
        const response = await fetch(`/api/entries/${entryId}/attachments`, {
          method: "POST",
          body: formData,
        });
        const body = (await response.json()) as
          | { status: "success"; kind: AttachmentKind }
          | { status: "error"; error: string }
          | { error: string };

        if (!response.ok) {
          updateItem(item.uploadId, {
            status: "error",
            error: "error" in body ? body.error : "Upload failed",
          });
          return;
        }

        if ("status" in body && body.status === "success") {
          updateItem(item.uploadId, {
            status: "success",
            kind: body.kind,
          });
          return;
        }

        updateItem(item.uploadId, {
          status: "error",
          error:
            "status" in body && body.status === "error"
              ? body.error
              : "Upload failed",
        });
      } catch {
        updateItem(item.uploadId, {
          status: "error",
          error: "Upload failed",
        });
      }
    },
    [entryId, updateItem],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newItems: UploadItem[] = Array.from(files).map((file) => ({
        uploadId: crypto.randomUUID(),
        file,
        fileName: file.name,
        status: "idle",
      }));

      setItems((current) => [...current, ...newItems]);

      void runWithConcurrency(
        newItems.map((item) => () => uploadFile(item)),
        UPLOAD_CONCURRENCY,
      );
    },
    [uploadFile],
  );

  return { items, addFiles };
}
