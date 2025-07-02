import api from '../api/axiosConfig';
import { FavoriteType } from '../types/api';

// Adicionar um favorito
export const addFavorite = async (favorite: Omit<FavoriteType, 'user'>): Promise<FavoriteType> => {
    const response = await api.post('/favorites', favorite);
    return response.data;
};

// Listar todos os favoritos
export const listFavorites = async (): Promise<FavoriteType[]> => {
    const response = await api.get('/favorites');
    return response.data;
};

// Listar favoritos de um usuário específico pelo userID
export const listFavoritesByUser = async (userID: string): Promise<FavoriteType[]> => {
    const response = await api.get(`/favorites/${userID}`);
    return response.data;
};

// Remover um favorito
export const removeFavorite = async (favoriteID: string): Promise<void> => {
    await api.delete(`/favorites/${favoriteID}`);
};