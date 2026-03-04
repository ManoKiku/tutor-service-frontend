interface Lesson
{
    id: string
    tutorId: string;
    tutorName: string;
    studentId: string;
    studentName: string;
    startTime: Date;
    endTime: Date;
    title: string;
    description: string;
    status: number;
    createdAt: Date;
    updatedAt: Date;
    assignments: Assignment[]
}

interface Assignment 
{
    id: string;
    lessonId: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    uploadedAt: Date;
    createdAt: Date;
    downloadUrl: string;
}

interface CreateAssignmentRequest {
  lessonId: string;
  file: File;
}

interface GetLessonsRequest
{
    userId: string | undefined;
    status: number | undefined;
    startDate: string | undefined;
    endDate: string | undefined;
    tutorId: string | undefined;
    studentId: string | undefined;
}

interface CreateLessonRequest
{
    studentId: string;
    startTime: Date;
    endTime: Date;
    title: string;
}