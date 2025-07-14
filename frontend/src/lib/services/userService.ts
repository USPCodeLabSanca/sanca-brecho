// SERVICE DO USUARIO EM SI

import api from "../api/axiosConfig";
import { UserType } from "../types/api";

// buscar informacao do usuario logado
export const getMe = async (): Promise<UserType> => {
    const response = await api.get("/users/me");
    return response.data;
}

// Atualizar informações do usuário logado
export const updateMe = async (updates: Partial<UserType>): Promise<UserType> => {
    const response = await api.put('/users/me', updates);
    return response.data;
};

// Deletar a conta do usuário logado
export const deleteMe = async (): Promise<void> => {
    await api.delete('/users/me');
};
