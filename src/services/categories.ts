import { appConfig } from '../../next.config';
import { fetchWithAuth } from './auth-data';

const API_BASE_URL = appConfig.apiUrl;
const ENDPOINT = 'categories';

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${ENDPOINT}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Fetch categories failed:', error);
    return [];
  }
}

export async function createCategory(data: CreateCategoryRequest): Promise<Category> {
  try {
    const result = await fetchWithAuth('/${ENDPOINT}', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result as Category;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(id: number, data: UpdateCategoryRequest): Promise<Category> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result as Category;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(id: number): Promise<void> {
  try {
    await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}