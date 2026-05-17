interface ReviewCreateRequest {
  tutorProfileId: string;
  rating: number;
  text: string;
}

interface ReviewDto {
  id: string;
  text: string;
  rating: number;
  userId: string;
  userName: string;
  avatarUrl: string;
  tutorProfileId: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface ReviewUpdateRequest {
  rating: number;
  text: string;
}