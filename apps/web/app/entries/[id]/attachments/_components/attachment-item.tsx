import type { UploadItem } from "./use-attachment-upload";

type AttachmentItemProps = {
  item: UploadItem;
};

export function AttachmentItem({ item }: AttachmentItemProps) {
  return (
    <li>
      <span>{item.fileName}</span>
      {item.kind ? <span> ({item.kind})</span> : null}
      <span> — {item.status}</span>
      {item.error ? <span> — {item.error}</span> : null}
    </li>
  );
}
