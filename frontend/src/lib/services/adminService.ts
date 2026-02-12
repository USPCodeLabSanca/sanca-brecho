import api from '../api/axiosConfig';

export interface DashboardStats {
    totalUsers: number;
    activeListings: number;
    listingsSold: number;
    pendingReports: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get('/admin/stats');
    return response.data;
};