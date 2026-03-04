interface TutorPost 
{
    id : string;
    subjectId : string;
    subjectName : string;
    tutorId : string;
    tutorName : string;
    description : string;
    hourlyRate : number;
    status : number;    
    adminComment: string | null;
    tags: string[]

}

interface TutorPostRequest {
    subjectId : string | undefined;
    cityId : string | undefined;
    status : number | undefined;
    tags : string | undefined;
    minRate : number | undefined;
    maxRate : number | undefined;
    search : string | undefined;
}

interface CreateTutorPostRequest {
    subjectId : number;
    description : string;
    tagIds : number[]
}

interface UpdateTutorPostRequest {
    subjectId : number;
    description : string;
}

