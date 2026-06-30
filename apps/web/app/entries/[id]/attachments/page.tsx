import { notFound } from "next/navigation";
import { guardAdminPage } from "@/auth/guard-admin-page";
import {
  entryRepository,
  InvalidEntryIdError,
} from "@/server/repositories/entry-repository";
import { AttachmentUploader } from "./_components/attachment-uploader";

type AttachmentsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function AttachmentsPage({ params }: AttachmentsPageProps) {
  await guardAdminPage();

  const { id } = await params;

  let entry;
  try {
    entry = await entryRepository.getById(id);
  } catch (error) {
    if (error instanceof InvalidEntryIdError) {
      notFound();
    }
    throw error;
  }

  if (!entry) {
    notFound();
  }

  return (
    <main>
      <h1>{entry.title}</h1>
      <p>Add photos</p>
      <AttachmentUploader entryId={id} />
    </main>
  );
}
