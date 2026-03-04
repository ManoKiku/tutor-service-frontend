import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

export async function getTutorPosts(params?: TutorPostRequest): Promise<TutorPost[]> {
    try {
        const url = new URL(appConfig.apiUrl + '/tutor-posts/search');
        
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
        const url = new URL(appConfig.apiUrl + '/tutor-posts/my');
        

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
        const url = appConfig.apiUrl + '/tutor-posts/tutors/' + id;

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
    const result = await fetchWithAuth('/tutor-posts', {
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
    const result = await fetchWithAuth(`/tutor-posts/${id}`, {
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
    await fetchWithAuth(`/tutor-posts/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

export async function moderateTutorPost(id: string, status : number): Promise<void> {
  try {
    await fetchWithAuth(`/tutor-posts/${id}/moderate?status=${status}`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Error moderating post:', error);
    throw error;
  }
}