import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

const ENDPOINT = 'tutor-posts';

export async function getTutorPosts(params?: TutorPostRequest): Promise<TutorPost[]> {
    try {
        const url = new URL(appConfig.apiUrl + `/${ENDPOINT}/search`);
        
        if (params) {
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        console.log(url.toString());

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json() as TutorPost[];

        return data;
    } catch (error) {
        console.error("Fetch failed:", error);
        return [];
    }
}

export async function getMyTutorPosts(status: number | null): Promise<TutorPost[]> {
    try {
        const url = new URL(appConfig.apiUrl + `/${ENDPOINT}/my`);
        

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json() as TutorPost[];

        return data;
    } catch (error) {
        console.error("Fetch failed:", error);
        return [];
    }
}

export async function getTutorPostsByTutorId(id : string): Promise<TutorPost[]> {
    try {
        const url = appConfig.apiUrl + `/${ENDPOINT}/tutors/` + id;

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json() as TutorPost[];

        return data;
    } catch (error) {
        console.error("Fetch failed:", error);
        return [];
    }
}


export async function createTutorPost(data: CreateTutorPostRequest): Promise<TutorPost> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    return result as TutorPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function updateTutorPost(id: string, data: UpdateTutorPostRequest): Promise<TutorPost> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return result as TutorPost;
  } catch (error) {
    console.error('Error updating post:', error);
    throw error;
  }
}

export async function deleteTutorPost(id: string): Promise<void> {
  try {
    await fetchWithAuth(`/${ENDPOINT}/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

export async function moderateTutorPost(id: string, status : number): Promise<void> {
  try {
    await fetchWithAuth(`/${ENDPOINT}/${id}/moderate?status=${status}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error moderating post:', error);
    throw error;
  }
}