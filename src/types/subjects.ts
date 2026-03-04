interface Subject {
  id: number;
  subcategoryId: number;
  name: string;
}

interface CreateSubjectRequest {
  subcategoryId: number;
  name: string;
}

interface UpdateSubjectRequest {
  subcategoryId: number;
  name: string;
}