import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

const API_BASE_URL = appConfig.apiUrl;
const ENDPOINT = 'tags';

export async function getTags(): Promise<Tag[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${ENDPOINT}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Fetch tags failed:', error);
    return [];
  }
}

export async function createTag(data: CreateTagRequest): Promise<Tag> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result as Tag;
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
}

export async function deleteTag(id: number): Promise<void> {
  try {
    await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    throw error;
  }
}