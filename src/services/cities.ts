import { appConfig } from '../../next.config';
import { fetchWithAuth } from './auth-data';

const API_BASE_URL = appConfig.apiUrl;
const ENDPOINT = 'Cities';

export async function getCities(): Promise<City[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/${ENDPOINT}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Fetch cities failed:', error);
    return [];
  }
}

export async function createCity(data: CreateCityRequest): Promise<City> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result as City;
  } catch (error) {
    console.error('Error creating city:', error);
    throw error;
  }
}

export async function updateCity(id: number, data: UpdateCityRequest): Promise<City> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result as City;
  } catch (error) {
    console.error('Error updating city:', error);
    throw error;
  }
}

export async function deleteCity(id: number): Promise<void> {
  try {
    await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting city:', error);
    throw error;
  }
}