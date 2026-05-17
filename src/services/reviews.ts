import { fetchWithAuth } from "./auth-data";

export async function createReview(data: ReviewCreateRequest): Promise<ReviewDto> {
  return fetchWithAuth('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  }) as Promise<ReviewDto>;
}

export async function getReviewsByTutor(tutorProfileId: string, page: number = 1, pageSize: number = 10): Promise<{ reviews: ReviewDto[]; total: number }> {
  return fetchWithAuth(`/reviews/tutor/${tutorProfileId}?page=${page}&pageSize=${pageSize}`) as Promise<{ reviews: ReviewDto[]; total: number }>;
}

export async function getReviewByTutorAndUser(tutorProfileId: string, userId: string): Promise<ReviewDto> {
  return fetchWithAuth(`/reviews/tutor/${tutorProfileId}/user/${userId}`) as Promise<ReviewDto>;
}

export async function updateReview(reviewId: string, data: ReviewUpdateRequest): Promise<ReviewDto> {
  return fetchWithAuth(`/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }) as Promise<ReviewDto>;
}

export async function deleteReview(reviewId: string): Promise<void> {
  await fetchWithAuth(`/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}