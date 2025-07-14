import axios from "axios";

const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api` || "http://localhost:8080/api",
    timeout: 5000,
    headers:{
        "Content-Type": "application/json",
    }
});

// Interceptor para requisicoes
api.interceptors.request.use(
    (config) => {
        // com tokenJWT
        // const token = localStorage.getItem('token');
        // if (token) {
        //     config.headers['Authorization'] = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }   
)

//Interceptor para respostas
api.interceptors.response.use(
    (response)=> response,
    (error)=>{
        const {status, __ } = error.response || {};

        console.error("API Error: ", error.response?.data || error.message, " STATUS: ", status);
        return Promise.reject(error); 
    }
)

export default api;