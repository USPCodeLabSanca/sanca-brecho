"use client"

import { signInWithGoogle } from "@/lib/firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import { useState } from "react";
import { showLoginSuccessToast } from "@/lib/toast";
import { login } from "@/lib/services/authService";

export default function Login() {
	const router = useRouter();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setErrorMessage(null);

		try {
			const userCredential = await signInWithGoogle();
			if (userCredential && userCredential.user) {
				const idToken = await userCredential.user.getIdToken();
				const user = await login(idToken);

				if (user && user.whatsapp) {
					showLoginSuccessToast(user.display_name.split(' ')[0] || "Usuário");
					router.push("/");
				} else {
					router.push("/onboarding");
				}

			} else {
				console.warn("Login pareceu bem-sucedido, mas não houve userCredential.");
				setErrorMessage("Ocorreu um problema ao obter seus detalhes. Tente novamente.");
			}
		} catch (error: any) {
			console.error("Falha no login:", error);
			if (error.response?.data?.error) {
				setErrorMessage(error.response.data.error);
			} else if (error.message === "Failed to fetch") {
				setErrorMessage("Erro de conexão. Verifique sua internet ou tente novamente mais tarde.");
			} else {
				setErrorMessage(`Algo deu errado: ${error.message}`);
			}
		}
	};

	return (
		<div className="min-h-screen flex justify-center items-center bg-[#f3eefe]">
			<main className="max-w-md w-full">
				<section className="text-center mb-2">
					<Link href="/">
						<h1 className="text-4xl font-bold text-sanca">Sanca Brechó</h1>
					</Link>
					<h2 className="mt-3 font-semibold">Entrar ou registrar sua conta</h2>
					<p className="text-sm text-gray-500 mt-1">Compre e venda produtos na comunidade universitária</p>
				</section>
				<section className="bg-white rounded-lg shadow-sm mx-2">

					<section className="p-4">
						<section className="space-y-4">
							<section className="space-y-2">
								<p className="text-center text-slate-600 text-sm">Entre com sua conta institucional</p>
							</section>

							{errorMessage && ( // Renderiza a mensagem de erro se houver
								<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-sm mb-4" role="alert">
									<span className="block sm:inline">{errorMessage}</span>
								</div>
							)}

							<button type="submit" onClick={handleLogin} className="cursor-pointer flex items-center justify-center gap-2 h-10 px-3 py-2 w-full bg-sanca hover:bg-sanca/90 rounded-md text-white text-sm font-medium"><FaGoogle />Entrar com Google</button>
						</section>
					</section>
				</section>
				<section className="text-center mt-1">
					<Link className="text-gray-500 text-sm hover:text-sanca" href="/">Voltar para a página inicial</Link>
				</section>
			</main>
		</div>
	)
}