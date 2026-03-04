import { User } from "@/types/auth";
import { appConfig } from "../../next.config";
import { fetchWithAuth } from "./auth-data";

export async function getUserById(id: string): Promise<User | null> {
    try {
        const url = appConfig.apiUrl + '/Users/' + id;

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

        const response = await fetchWithAuth<User[]>( '/Users/');

        return response!;
    } catch (error) {
        console.error("Fetch failed:", error);
        return [];
    }
}

export async function deleteUser(id: string): Promise<boolean> {
    try {

        await fetchWithAuth<User[]>('/Users/' + id, {method: 'DELETE'});

        return true;
    } catch (error) {
        console.error("Fetch failed:", error);
        return false;
    }
}

