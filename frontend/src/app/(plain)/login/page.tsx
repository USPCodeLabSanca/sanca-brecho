"use client"

import { signInWithGoogle } from "@/lib/firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";

export default function Login() {
    const router = useRouter();

    const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        try {
        const userCredential = await signInWithGoogle();
        if (userCredential && userCredential.user) {
            // O AuthContext vai detectar a mudança de estado.
            // Apenas redirecionamos.
            router.push("/onboarding");
        } else {
            // Caso improvável se signInWithGoogle estiver correto, mas bom ter um fallback
            console.warn("Login pareceu bem-sucedido, mas não houve userCredential.");
            alert("Ocorreu um problema ao obter seus detalhes. Tente novamente.");
        }
        } catch (error) {
        console.error("Falha no login:", error);
        alert("Algo deu errado durante o login."); // TODO: Melhorar feedback
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
                <section className="bg-white rounded-lg shadow-sm">

                    <section className="p-4">
                        {/* Será utilizado cookies perguntar em reunião? */}
                        <section className="space-y-4">
                            <section className="space-y-2">
                                <p className="text-center text-slate-600 text-sm">Entre com sua conta institucional</p>
                            </section>
                            <button type="submit" onClick={handleLogin} className="cursor-pointer flex items-center justify-center gap-2 h-10 px-3 py-2 w-full bg-sanca hover:bg-sanca/90 rounded-md text-white text-sm font-medium"><FaGoogle/>Entrar com Google</button>
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