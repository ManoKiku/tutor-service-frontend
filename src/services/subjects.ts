import { appConfig } from '../../next.config';
import { fetchWithAuth } from './auth-data';

const API_BASE_URL = appConfig.apiUrl;
const ENDPOINT = 'Subjects';

export async function getSubjects(): Promise<Subject[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${ENDPOINT}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Fetch subjects failed:', error);
    return [];
  }
}

export async function createSubject(data: CreateSubjectRequest): Promise<Subject> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result as Subject;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
}

export async function updateSubject(id: number, data: UpdateSubjectRequest): Promise<Subject> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result as Subject;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
}

export async function deleteSubject(id: number): Promise<void> {
  try {
    await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
}