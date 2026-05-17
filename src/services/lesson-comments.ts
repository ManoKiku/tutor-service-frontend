import { fetchWithAuth } from "./auth-data";

export async function addComment(lessonId: string, text: string): Promise<LessonCommentDto> {
  return fetchWithAuth(`/lessons/${lessonId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  }) as Promise<LessonCommentDto>;
}

export async function getComments(lessonId: string): Promise<LessonCommentDto[]> {
  return fetchWithAuth(`/lessons/${lessonId}/comments`) as Promise<LessonCommentDto[]>;
}

export async function deleteComment(lessonId: string, commentId: string): Promise<void> {
  await fetchWithAuth(`/lessons/${lessonId}/comments/${commentId}`, {
    method: 'DELETE',
  });
}