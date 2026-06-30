import "server-only";

import { logger } from "@/lib/logger";
import type {
  AttachmentStorageProvider,
  AttachmentStorageStoreParams,
} from "./types";

export const noopStorageProvider: AttachmentStorageProvider = {
  async store(params: AttachmentStorageStoreParams) {
    const url = `noop://${params.entryId}/${encodeURIComponent(params.fileName)}`;

    logger.info(
      {
        event: "attachment.upload.noop",
        entryId: params.entryId,
        fileName: params.fileName,
        mimeType: params.mimeType,
        size: params.size,
        url,
      },
      "noop attachment storage",
    );

    return { url };
  },
};
