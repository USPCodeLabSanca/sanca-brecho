// Service das denúncias

import api from '../api/axiosConfig';
import { ReportStatus, ReportType } from '../types/api';

// Payload para criar uma nova denúncia
type CreateReportPayload = {
  target_id: string;
  target_type: 'product' | 'user';
  reason: string;
  details?: string;
};

// Interface para a resposta paginada de denúncias
export interface PaginatedReportsResponse {
  reports: ReportType[];
  total: number;
  page: number;
  pageSize: number;
}

// Cria uma nova denúncia
export const createReport = async (payload: CreateReportPayload): Promise<ReportType> => {
    const response = await api.post('/reports/', payload);
    return response.data;
};

// Busca as denúncias com paginação e filtro de status (Apenas Admin).
export const getReports = async (
  page: number,
  pageSize: number,
  status: 'open' | 'closed'
): Promise<PaginatedReportsResponse> => {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        status: status,
    });
    
    const response = await api.get(`/reports/?${params.toString()}`);
    return response.data;
};

// Busca uma denúncia específica pelo ID (Apenas Admin).
export const getReportById = async (id: string): Promise<ReportType> => {
    const response = await api.get(`/reports/${id}/`);
    return response.data;
};

// Atualiza o status de uma denúncia (Apenas Admin).
export const updateReportStatus = async (id: string, status: ReportStatus): Promise<ReportType> => {
    const response = await api.put(`/reports/${id}/status`, { status });
    return response.data;
};