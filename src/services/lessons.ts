import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

export async function getLessons(data: GetLessonsRequest): Promise<Lesson[]> {
  try {
    let query: string = '';
    if (data) {
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query += `${key}=${value}&`
            }
        });
    }

    const response = await fetchWithAuth('/Lessons?' + query);
    
    return response as Lesson[];
  } catch (error) {
    console.error('Error getting lessons:', error);
    throw error;
  }
}

export async function createLesson(data: CreateLessonRequest): Promise<Lesson | null> {
  try {
    const result = await fetchWithAuth('/Lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result as Lesson;
  } catch (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  try {
    const result = await fetchWithAuth(`/Lessons/${id}`);
    return result as Lesson;
  } catch (error) {
    console.error('Error getting lesson:', error);
    throw error;
  }
}


export async function deleteLesson(id: string): Promise<void> {
  try {
    await fetchWithAuth(`/Lessons/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
}