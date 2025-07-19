import axios from "axios";
import { auth } from "@/lib/firebase/config";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    }
});

api.interceptors.request.use(
    async (config) => {
        try {
            const user = auth.currentUser;
            if (user) {
                const idToken = await user.getIdToken();
                config.headers.Authorization = `Bearer ${idToken}`;
            }
        } catch (error) {
            console.error('Erro ao obter token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const { status } = error.response || {};
        
        if (status === 401 && auth.currentUser) {
            try {
                const newToken = await auth.currentUser.getIdToken(true);
                
                if (error.config) {
                    error.config.headers.Authorization = `Bearer ${newToken}`;
                    return api.request(error.config);
                }
            } catch (tokenError) {
                console.error('Erro ao renovar token:', tokenError);
            }
        }
        
        console.error("API Error:", error.response?.data || error.message, "STATUS:", status);
        return Promise.reject(error);
    }
);

export default api;