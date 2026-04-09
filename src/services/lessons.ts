import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

const ENDPOINT = 'Lessons';

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

    const response = await fetchWithAuth(`/${ENDPOINT}?` + query);
    
    return response as Lesson[];
  } catch (error) {
    console.error('Error getting lessons:', error);
    throw error;
  }
}

export async function createLesson(data: CreateLessonRequest): Promise<Lesson | null> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}`, {
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
    const result = await fetchWithAuth(`/${ENDPOINT}/${id}`);
    return result as Lesson;
  } catch (error) {
    console.error('Error getting lesson:', error);
    throw error;
  }
}


export async function deleteLesson(id: string): Promise<void> {
  try {
    await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
}