import axios from "axios";
import { getIdToken } from "firebase/auth";
import { auth } from "../firebase/config";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/brechoapi` || "http://localhost:8080/brechoapi",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    }
});

// Interceptor para requisicoes
api.interceptors.request.use(
    async (config) => {
        // Adiciona o token de autenticação do Firebase se o usuário estiver autenticado
        const user = auth.currentUser;
        if (user) {
            try {
                const token = await getIdToken(user, false);
                config.headers["Authorization"] = `Bearer ${token}`;
            } catch (error) {
                console.error("Error getting Firebase ID token:", error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
)

//Interceptor para respostas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { status, __ } = error.response || {};

        console.error("API Error: ", error.response?.data || error.message, " STATUS: ", status);
        return Promise.reject(error);
    }
)

export default api;