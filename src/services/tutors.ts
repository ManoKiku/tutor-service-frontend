import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

const ENDPOINT = 'Tutors';

export async function getTutorsData(params?: TutorsRequest): Promise<Tutor[]> {
    try {
        const url = new URL(appConfig.apiUrl + `/${ENDPOINT}/search`);
        
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as Tutor[];
        return data;
    } catch (error) {
        console.error("Fetch failed:", error);
        return [];
    }
}

export async function getTutorProfileById(id : string): Promise<Tutor | null> {
    try {
        const url = new URL(appConfig.apiUrl + `/${ENDPOINT}/` + id);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

         
        return response.json();
    } catch (error) {
        console.error("Fetch failed:", error);
        return null;
    }
}

export async function getTutorProfileByUserId(id : string): Promise<Tutor | null> {
    try {
        const url = new URL(appConfig.apiUrl + `/Users/${id}/tutor-profile`);

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

         
        return response.json();
    } catch (error) {
        console.error("Fetch failed:", error);
        return null;
    }
}

export async function updateTutorProfile(
  profileData: UpdateTutorRequest
): Promise<Tutor> {

  const method = 'PUT';

  const response = await fetchWithAuth(`/${ENDPOINT}/profile`, {
    method,
    body: JSON.stringify(profileData),
  });

  return response as Tutor;
}
