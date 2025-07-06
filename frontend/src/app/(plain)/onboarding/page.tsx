"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Onboarding() {
  const { user, loading, firstName } = useAuth();
  const router = useRouter();

  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');

  useEffect(() => {
    // Se não estiver carregando e não houver usuário, redireciona para o login
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleOnboardingSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert("Usuário não autenticado!");
      return;
    }
    try {
      console.log("Dados do Onboarding:", { userId: user.uid, whatsapp, telegram });
      router.push("/");
    } catch (error) {
      console.error("Erro ao finalizar cadastro:", error);
      alert("Erro ao finalizar cadastro.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3eefe]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-[spin_4s_linear_infinite]  border-sanca"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f3eefe]">
      <main className="max-w-md w-full">
        <div className="text-center mb-2">
          {/* Exibe o primeiro nome */}
          {firstName && (
            <h1 className="text-2xl mb-1 font-semibold">Olá, {firstName}!</h1>
          )}
          <h2 className="text-xl font-medium">Finalize seu cadastro</h2>
        </div>
        
        {/* TODO: Implementar uma máscara de input pro WhatsApp */}
        <div className="bg-white rounded-lg shadow-sm">
          <form className="p-4 space-y-4" onSubmit={handleOnboardingSubmit}>
            <div className="space-y-2">
              <label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp (com DDD)*
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={whatsapp}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setWhatsapp(e.target.value)}
                placeholder="(11) 91234-5678"
                className="flex h-10 w-full font-medium rounded-md border border-gray-300 p-3 text-sm"
                required
                pattern="\(?\d{2}\)?\s?\d{4,5}-?\d{4}"
                title="Informe um número válido com DDD"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="telegram" className="text-sm font-medium">
                Telegram (opcional)
              </label>
              <input
                type="text"
                id="telegram"
                name="telegram"
                value={telegram}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setTelegram(e.target.value)}
                placeholder="Seu usuário do Telegram (sem @)"
                className="flex h-10 w-full font-medium rounded-md border border-gray-300 px-3 py-2 text-sm"
                pattern="^[^@]*$"
                title="Não inclua o símbolo @"
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 px-3 py-2 rounded-md bg-sanca hover:bg-sanca/90 text-white text-sm font-medium"
            >
              Finalizar Cadastro
            </button>
          </form>

          <p className="text-xs pb-4 text-center text-gray-500">
            Estas informações serão usadas apenas para comunicação entre usuários.<br />
            Nunca compartilharemos seus dados com terceiros.
          </p>
        </div>
      </main>
    </div>
  );
}