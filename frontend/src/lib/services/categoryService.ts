import api from '../api/axiosConfig';
import { CategoryType } from '../types/api';

// Buscar todas as categorias
export const getCategories = async (): Promise<CategoryType[]> => {
    const response = await api.get('/categories');
    return response.data;
};

// Buscar uma categoria específica pelo ID
export const getCategoryById = async (id: number): Promise<CategoryType> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
};

// Criar uma nova categoria
export const createCategory = async (category: Omit<CategoryType, 'id' | 'parent' | 'children'>): Promise<CategoryType> => {
    const response = await api.post('/categories', category);
    return response.data;
};

// Atualizar uma categoria existente
export const updateCategory = async (id: number, updates: Partial<CategoryType>): Promise<CategoryType> => {
    const response = await api.put(`/categories/${id}`, updates);
    return response.data;
};

// Deletar uma categoria
export const deleteCategory = async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
};