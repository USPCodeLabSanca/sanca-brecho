import toast from "react-hot-toast";


export const showSuccessToast = (message: string)=>{
    toast.success(message,{
        style:{
            
        },
        iconTheme:{
            primary: "#4caf50", 
            secondary: "#fff",
        }
    })
}

export const showErrorToast = (message: string)=>{
    toast.error(message,{
        style:{
            
        },
        iconTheme:{
            primary: "#dc3545", 
            secondary: "#fff",
        }
    })
}

/**
 * Notificacao para quando um usuario é logado com sucesso
 * @param userName - O nome do usuario
*/

export const showLoginSuccessToast = (userName: string)=>{
    toast.success("Olá, " + userName + "! Você está logado com sucesso.", {
        icon: "👋",
        style: {
            background: "#f0f0f0",
            color: "#333",
        },
    })
}

export const showLogoutSuccessToast = ()=>{
    toast.success("Você foi desconectado com sucesso.", {
        icon: "👋",
        style: {
            background: "#f0f0f0",
            color: "#333",
        },
    })
}
/**
 * Função para lidar com chamadas de API e exibir notificações
 */
export const handleApiCall = (
    promise: Promise<any>,
    successMessage = "Processando",
    errorMessage = "Ocorreu um erro",
    loadingMessage = "Processando..."
)=>{
    toast.promise(promise, {
        loading: loadingMessage,
        success: ()=>{
            return successMessage;
        },
        error: (error) => {
            return error.message || errorMessage;   
        },
    })
}