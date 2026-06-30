export type StoredAttachment = {
  url: string;
};

export type AttachmentStorageStoreParams = {
  entryId: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export type AttachmentStorageProvider = {
  store(params: AttachmentStorageStoreParams): Promise<StoredAttachment>;
};
