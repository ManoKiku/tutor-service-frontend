enum SubmissionType {
  File = 0,
  Link = 1
}

 interface LessonTaskCreateRequest {
  lessonId: string;
  file?: File;
  link?: string;
}

interface LessonTaskDto {
  id: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  fileName?: string | null;
  fileSize?: number | null;
  contentType?: string | null;
  link?: string | null;
  type: SubmissionType;
  createdAt: Date;
}