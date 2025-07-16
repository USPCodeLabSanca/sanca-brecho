//Service de perfis

import api from '../api/axiosConfig';
import { ProfileType } from '../types/api';

// Buscar informações de um perfil específico pelo slug
export const getProfileBySlug = async (slug: string): Promise<ProfileType> => {
    const response = await api.get(`/profile/${slug}`);

    return response.data.user;
};

// Buscar metricas de um perfil específico pelo slug
export const getProfileMetricsBySlug = async (slug: string): Promise<any> => {
    const response = await api.get(`/profile/${slug}/metrics`);
    return response.data;
};