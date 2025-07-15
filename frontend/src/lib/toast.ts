import toast from "react-hot-toast";


export const showSuccessToast = (message: string)=>{
    toast.success(message,{
        style:{
            fontSize: "16px",
            fontWeight: "bold",
            border: "1px solid #4caf50",
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
            fontSize: "16px",
            fontWeight: "bold",
            border: "1px solid #dc3545",
        },
        iconTheme:{
            primary: "#dc3545", 
            secondary: "#fff",
        }
    })
}


export const showNotificationToast = (message: string)=>{
    toast(message, {
        icon: "🔔",
        style: {
            background: "#ffff",
            color: "#8b5cf6",
            fontWeight: "bold",
        },
        duration: 5000, // Duração de 5 segundos
    })
}

/**
 * Notificacao para quando um usuario é logado com sucesso
 * @param userName - O nome do usuario
*/

export const showLoginSuccessToast = (userName: string)=>{
    toast.success("Olá, " + userName + "! Login realizado com sucesso.", {
        icon: "👋",
        style: {
            background: "#ffff",
            color: "#8b5cf6",
            fontWeight: "bold",
        },
        duration: 5000, // Duração de 5 segundos
    })
}

/**
 * Notificacao para quando um usuario é deslogado com sucesso
*/
export const showLogoutSuccessToast = ()=>{
    toast.success("Você foi desconectado com sucesso.", {
        icon: "👋",
        style: {
            background: "#ffff",
            color: "#8b5cf6",
            fontWeight: "bold",
        },
        duration: 5000, // Duração de 5 segundos
    })
}