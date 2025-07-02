import api from "../api/axiosConfig";
import { UserType } from "../types/api";

// O idToken é um JWT gerado pelo Firebase que contém informações do usuário autenticado.

export const login = async(idToken: string): Promise<UserType> => {
    const response = await api.post('/login', {}, {
        headers: {
            Authorization: `Bearer ${idToken}`,
        },
    });
    return response.data.user; // Retorna um usuario
}