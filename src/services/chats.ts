import { getAuthData } from "@/lib/auth";
import { fetchWithAuth } from "./auth-data";

export async function getChats(): Promise<Chat[]> {
  try {
    const response = await fetchWithAuth<Chat[]>(`/Chats/my-chats`);

    if(response == null)
        throw new Error("Access denied. No response was represented");

    return response;
  } catch (error) {
    console.error('Fetch chats failed:', error);
    return [];
  } 
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  try {
    const response = await fetchWithAuth<Message[]>(`/Chats/${chatId}/messages`);

    if(response == null)
        throw new Error("Access denied. No response was represented");

    return response;
  } catch (error) {
    console.error('Fetch chats failed:', error);
    return [];
  }
}

export async function isHaveChatWithTutor(tutorId : string): Promise<Chat | null> {
  try {
    const response = await fetchWithAuth<Chat>(`/Chats/tutor/${tutorId}`);

    return response;
  } catch (error) {
    console.error('Fetch chats failed:', error);
    return null;
  }
}

export async function createChatWithTutor(tutorId : string): Promise<Chat | null> {
  try {
    const {user} = getAuthData(false);

    if(user == null)
        throw new Error("User is not signed in")

    const response = await fetchWithAuth<Chat>(`/Chats`, {
        body: JSON.stringify({tutorId: tutorId, studentId: user.id}),
        method: 'POST'
    });

    return response;
  } catch (error) {
    console.error('Fetch chats failed:', error);
    return null;
  }
}
