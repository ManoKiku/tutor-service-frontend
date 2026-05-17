import { getAuthData } from "@/lib/auth";
import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

const ENDPOINT = 'saved-content';

export async function uploadSavedContent(data: AddSavedContentRequest): Promise<SavedContentDto> {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.folderId) formData.append('FolderId', data.folderId);

  return fetchWithAuth('/saved-content', {
    method: 'POST',
    body: formData,
  }, false) as Promise<SavedContentDto>;
}

export async function getSavedContent(): Promise<SavedContentDto[]> {
  const response = await fetchWithAuth(`/${ENDPOINT}`);
  return response as SavedContentDto[];
}

export async function deleteSavedContent(savedContentId: string): Promise<void> {
  await fetchWithAuth(`/${ENDPOINT}/${savedContentId}`, {
    method: 'DELETE',
  });
}

export async function getSavedContentDownloadUrl(savedContent: SavedContentDto): Promise<string | undefined> {
  try {
      const data = getAuthData(false); 

      const response = await fetch(appConfig.apiUrl + `/${ENDPOINT}/${savedContent.id}/download`, {
        headers : {
            'Authorization' : `Bearer ${data.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);
      
      const blob = await response.blob();
      
      console.log('Blob size:', blob.size)
      
      const url = window.URL.createObjectURL(blob);
      
      return url;      
    } catch (error) {
      console.error('Download error:', error);
      return undefined;
    }
}

export async function createFolder(name: string): Promise<SavedContentFolderDto> {
  return fetchWithAuth('/saved-content/folders', {
    method: 'POST',
    body: JSON.stringify({ name }),
  }) as Promise<SavedContentFolderDto>;
}

export async function getFolders(): Promise<SavedContentFolderDto[]> {
  return fetchWithAuth('/saved-content/folders') as Promise<SavedContentFolderDto[]>;
}

export async function deleteFolder(folderId: string): Promise<void> {
  await fetchWithAuth(`/saved-content/folders/${folderId}`, {
    method: 'DELETE',
  });
}