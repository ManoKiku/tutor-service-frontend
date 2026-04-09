import { getAuthData } from "@/lib/auth";
import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

const ENDPOINT = 'Assignments';

export async function uploadAssignment(data: CreateAssignmentRequest): Promise<Assignment> {
  const formData = new FormData();
  formData.append('lessonId', data.lessonId);
  formData.append('file', data.file);

  const response = await fetchWithAuth(`/${ENDPOINT}`, {
    method: 'POST',
    body: formData,
  }, false);
  
  return response as Assignment;
}

export async function deleteAssignment(assignmentId: string): Promise<void> {
  await fetchWithAuth(`/${ENDPOINT}/${assignmentId}`, {
    method: 'DELETE',
  });
}

export async function getAssignmentsByLessonId(lessonId: string): Promise<Assignment[]> {
  const response = await fetchWithAuth(`/${ENDPOINT}/lessons/${lessonId}/assignments`);
  return response as Assignment[];
}

export async function getAssigmentDownloadUrl(assignment: Assignment): Promise<string | undefined> {
  try {
      const data = getAuthData(false); 

      const response = await fetch(appConfig.apiUrl + `/${ENDPOINT}/${assignment.id}/download`, {
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