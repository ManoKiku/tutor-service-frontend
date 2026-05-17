import { fetchWithAuth } from "./auth-data";
import { getAuthData } from "@/lib/auth";
import { appConfig } from "../../next.config";

export async function addTask(lessonId: string, data: { file?: File; link?: string }): Promise<LessonTaskDto> {
  const formData = new FormData();
  formData.append('lessonId', lessonId);
  if (data.file) formData.append('file', data.file);
  if (data.link) formData.append('link', data.link);

  return fetchWithAuth(`/lessons/${lessonId}/tasks`, {
    method: 'POST',
    body: formData,
  }, false) as Promise<LessonTaskDto>;
}

export async function getTasks(lessonId: string): Promise<LessonTaskDto[]> {
  return fetchWithAuth(`/lessons/${lessonId}/tasks`) as Promise<LessonTaskDto[]>;
}

export async function deleteTask(lessonId: string, taskId: string): Promise<void> {
  await fetchWithAuth(`/lessons/${lessonId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}


export async function getTaskDownloadUrl(taskId: string): Promise<string | undefined> {
  try {
    const data = getAuthData(false);
    const response = await fetch(appConfig.apiUrl + `/lesson-tasks/${taskId}/download`, {
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
  } catch (error) {
    console.error('Download error:', error);
    return undefined;
  }
}