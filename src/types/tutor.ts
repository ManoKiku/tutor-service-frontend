interface Tutor 
{
    id : string;
    userId : string;
    bio : string;
    education : string;
    experienceYears : number;
    hourlyRate : number;
}

interface TutorsRequest {
    categoryId : string | undefined;
    subcategoryId : string | undefined;
    subjectId : string | undefined;
    cityId : string | undefined;
    tagIds : string | undefined;
    minRate : number | undefined;
    maxRate : number | undefined;
    search : string | undefined;
}

interface UpdateTutorRequest {
  bio: string;
  education: string;
  experienceYears: number;
  hourlyRate: number;
}