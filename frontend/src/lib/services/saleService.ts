import api from "../api/axiosConfig";
import { ErrorType, ReviewType, SaleType } from "../types/api";

export const getSale = async (id: string): Promise<SaleType> => {
    const response = await api.get(`/sales/${id}`);
    return response.data;
}

// Buscar as compras do usuário
export const getSalesAsBuyer = async (): Promise<SaleType[]> => {
    const response = await api.get(`/sales/buyer`);
    return response.data;
}

// Buscar as vendas do usuário
export const getSalesAsSeller = async (): Promise<SaleType[]> => {
    const response = await api.get(`/sales/seller`);
    return response.data;
}

export const createReview = async (id: string, rating: number, comment: string): Promise<ReviewType | ErrorType> => {
    const response = await api.post(`/sales/${id}/review`, { rating, comment });
    return response.data;
}