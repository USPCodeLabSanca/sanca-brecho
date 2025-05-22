"use client"

import { signInWithGoogle } from "@/lib/firebase/auth";
import Link from "next/link";

export default function Login() {
    const handleLogin = async (e: any) => {
        e.preventDefault();
        try {
            await signInWithGoogle();
            alert("Logged in!");
        } catch (error) {
            alert("Something went wrong");
        }
    };
    return (
        <div className="min-h-screen flex justify-center items-center">
            <main className="max-w-md w-full">
                <section className="text-center mb-2">
                    <Link href="/">
                        <h1 className="text-xl font-bold text-sanca">Sanca Brechó</h1>
                    </Link>
                    <h2 className="mt-3 font-semibold">Entrar na sua conta</h2>
                    <p className="text-sm text-gray-500 mt-1">Compre e venda produtos na comunidade universitária</p>
                </section>
                <section className="bg-gray-100 rounded-lg shadow-sm">

                    <section className="p-4">
                        {/* Será utilizado cookies perguntar em reunião? */}
                        <form onSubmit={handleLogin}>
                            <section className="space-y-4">
                                <section className="space-y-2">
                                    {/* Realizar verifações em relação ao domínio do email e tamanho, regex? */}
                                    <label className="text-sm font-medium" htmlFor="email">Email:</label>
                                    <input type="text" placeholder="seu@email.edu.br" id="email" className="flex h-10 w-full font-medium rounded-md border border-gray-300 p-3 md:text-sm" required />
                                </section>
                                <section className="space-y-2">
                                    <section className="flex justify-between items-center">
                                        <label className="text-sm font-medium" htmlFor="email">Password:</label>
                                        <a className="text-xs text-sanca hover:underline" href="#">Esqueceu sua senha?</a>
                                    </section>
                                    {/* Realizar verifações em relação ao tamanho */}
                                    <input className="flex h-10 w-full font-medium rounded-md border border-gray-300 px-3 py-2 md:text-sm" type="password" placeholder="********" required />
                                </section>
                                <button type="submit" className="cursor-pointer items-center justify-center gap-2 h-10 px-3 py-2 w-full bg-sanca hover:bg-sanca/90 rounded-md text-white text-sm font-medium">Entrar</button>
                            </section>
                        </form>
                    </section>
                    <section className="flex items-center p-4">
                        {/* ajustar para link quando tiver register */}
                        <p className="text-sm text-center w-full text-gray-500">Não tem uma conta? <a className="text-sanca hover:underline" href="#">Registre-se</a> </p>
                    </section>
                </section>
                <section className="text-center mt-3">
                    <Link className="text-gray-500 text-sm hover:text-sanca" href="/">Voltar para a página início</Link>
                </section>
            </main>
        </div>
    )
}