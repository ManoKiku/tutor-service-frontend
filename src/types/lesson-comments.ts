interface LessonCommentCreateRequest {
  text: string;
}

interface LessonCommentDto {
  id: string;
  lessonId: string;
  tutorId: string;
  tutorName: string;
  text: string;
  createdAt: Date;
}