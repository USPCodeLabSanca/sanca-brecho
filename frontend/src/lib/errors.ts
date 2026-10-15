import axios from "axios";

export type FriendlyError = { title: string; message: string };

export function getFriendlyError(error: unknown): FriendlyError {
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return {
        title: "O servidor demorou para responder",
        message: "Tente novamente em alguns instantes.",
      };
    }
    if (!error.response) {
      return {
        title: "Não conseguimos conectar ao servidor",
        message: "Verifique sua conexão ou tente novamente em instantes. Pode ser uma instabilidade nossa.",
      };
    }
    if (error.response.status >= 500) {
      return {
        title: "Tivemos um problema por aqui",
        message: "Já estamos de olho. Tente novamente em instantes.",
      };
    }
    if (error.response.data?.error) {
      return { title: "Algo deu errado", message: error.response.data.error };
    }
  }
  return { title: "Algo deu errado", message: "Ocorreu um erro inesperado. Tente novamente." };
}