import { ChangePasswordRequest, UpdateUserRequest, User } from "@/types/auth";
import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

const ENDPOINT = 'users';

export async function getUserById(id: string): Promise<User | null> {
    try {
        const url = appConfig.apiUrl + `/${ENDPOINT}/` + id;

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as User;
        return data;
    } catch (error) {
        console.error("Fetch failed:", error);
        return null;
    }
}

export async function getUsers(): Promise<User[]> {
    try {

        const response = await fetchWithAuth<User[]>(`/${ENDPOINT}/`);

        return response!;
    } catch (error) {
        console.error("Fetch failed:", error);
        return [];
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    try {

        await fetchWithAuth<User[]>(`/${ENDPOINT}/` + id, {method: 'DELETE'});

        return true;
    } catch (error) {
        console.error("Fetch failed:", error);
        return false;
    }
}

export async function updateUserProfile(data: UpdateUserRequest): Promise<User> {
  const response = await fetchWithAuth<User>(`/${ENDPOINT}/profile`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response!;
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await fetchWithAuth('/users/change-password', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getUserAvatarUrl(userId: string): Promise<string | null> {
  try {
    const response = await fetch(`${appConfig.apiUrl}/${ENDPOINT}/${userId}/avatar`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to fetch avatar:', error);
    return null;
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<{ fileId: string; message: string }> {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetchWithAuth<{ fileId: string; message: string }>(`/${ENDPOINT}/${userId}/avatar`, {
    method: 'POST',
    body: formData,
  }, false);

  return response!;
}

export async function deleteAvatar(userId: string): Promise<void> {
  await fetchWithAuth(`/${ENDPOINT}/${userId}/avatar`, {
    method: 'DELETE',
  });
}