import api from "../api/axiosConfig";
import { ReviewType } from "../types/api";

export const getReviewsReceived = async (user_slug: string): Promise<ReviewType[]> => {
    const response = await api.get(`/reviews/${user_slug}/received`);
    return response.data;
}

