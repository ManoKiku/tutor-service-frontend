import { User } from "@/types/auth";
import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

const ENDPOINT = 'users';

export async function getUserById(id: string): Promise<User | null> {
    try {
        const url = appConfig.apiUrl + `/${ENDPOINT}/` + id;

        const response = await fetch(url.toString());
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as User;
        return data;
    } catch (error) {
        console.error("Fetch failed:", error);
        return null;
    }
}

export async function getUsers(): Promise<User[]> {
    try {

        const response = await fetchWithAuth<User[]>(`/${ENDPOINT}/`);

        return response!;
    } catch (error) {
        console.error("Fetch failed:", error);
        return [];
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    try {

        await fetchWithAuth<User[]>(`/${ENDPOINT}/` + id, {method: 'DELETE'});

        return true;
    } catch (error) {
        console.error("Fetch failed:", error);
        return false;
    }
}

