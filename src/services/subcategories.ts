import { appConfig } from '../../next.config';
import { fetchWithAuth } from './auth-data';

const API_BASE_URL = appConfig.apiUrl;

export async function getSubcategories(): Promise<Subcategory[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/Subcategories`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Fetch subjects failed:', error);
    return [];
  }
}

export async function createSubcategories(data: CreateSubcategoryRequest): Promise<Subcategory> {
  try {
    const result = await fetchWithAuth('/Subcategories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result as Subcategory;
  } catch (error) {
    console.error('Error creating subject:', error);
    throw error;
  }
}

export async function updateSubcategories(id: number, data: UpdateSubcategoryRequest): Promise<Subcategory> {
  try {
    const result = await fetchWithAuth(`/Subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result as Subcategory;
  } catch (error) {
    console.error('Error updating subject:', error);
    throw error;
  }
}

export async function deleteSubcategories   (id: number): Promise<void> {
  try {
    await fetchWithAuth(`/Subcategories/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    throw error;
  }
}