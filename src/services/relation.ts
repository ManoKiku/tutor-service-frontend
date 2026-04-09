import { fetchWithAuth } from "./auth-data";

const ENDPOINT = 'StudentTutorRelations';

export async function checkRelation(studentId: string, tutorId: string): Promise<Relation | null> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}/check?studentId=${studentId}&tutorId=${tutorId}`);
    return result as Relation;
  } catch (error) {
    console.error('Error checking relation:', error);
    throw error;
  }
}

export async function addRelation(studentId: string): Promise<Relation | null> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}`, {
        method: 'POST',
        body: JSON.stringify({studentId: studentId})
    });
    return result as Relation;
  } catch (error) {
    console.error('Error adding relation:', error);
    throw error;
  }
}

export async function deleteRelation(studentId: string): Promise<boolean> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}/${studentId}`, {
        method: 'DELETE',
    });
    return true;
  } catch (error) {
    console.error('Error deleting relation:', error);
    return false;
  }
}


export async function getMyStudents(): Promise<Relation[] | null> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}/my-students`);
    return result as Relation[];
  } catch (error) {
    console.error('Error getting students relation:', error);
    throw error;
  }
}

export async function getMyTutors(): Promise<Relation[] | null> {
  try {
    const result = await fetchWithAuth(`/${ENDPOINT}/my-tutors`);
    return result as Relation[];
  } catch (error) {
    console.error('Error getting tutors relation:', error);
    throw error;
  }
}