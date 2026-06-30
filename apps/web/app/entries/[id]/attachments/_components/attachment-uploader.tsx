"use client";

import { AttachmentItem } from "./attachment-item";
import { useAttachmentUpload } from "./use-attachment-upload";

type AttachmentUploaderProps = {
  entryId: string;
};

export function AttachmentUploader({ entryId }: AttachmentUploaderProps) {
  const { items, addFiles } = useAttachmentUpload(entryId);

  return (
    <section>
      <label>
        Choose photos
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => {
            const { files } = event.target;
            if (files && files.length > 0) {
              addFiles(files);
            }
            event.target.value = "";
          }}
        />
      </label>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <AttachmentItem key={item.uploadId} item={item} />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
