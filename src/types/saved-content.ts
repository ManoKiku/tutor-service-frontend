interface SavedContentDto
{
    id: string;
    tutorId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    createdAt: Date;
    downloadUrl: string;
}

interface AddSavedContentRequest
{
    file: File;
}