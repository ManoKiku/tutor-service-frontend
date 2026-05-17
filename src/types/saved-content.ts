interface SavedContentDto
{
    id: string;
    tutorId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    createdAt: Date;
    downloadUrl: string;
    folderId?: string | null;
    folderName?: string | null;
}

interface AddSavedContentRequest
{
    file: File;
    folderId?: string;
}

interface SavedContentFolderCreateRequest {
  name: string;
}

interface SavedContentFolderDto {
  id: string;
  name: string;
  itemCount: number;
  createdAt: Date;
}