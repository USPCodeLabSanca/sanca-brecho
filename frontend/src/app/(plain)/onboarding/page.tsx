"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { IMaskInput } from 'react-imask';

// Estendendo a interface da Window para o reCAPTCHA
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function Onboarding() {
  const { user, loading, firstName } = useAuth();
  const router = useRouter();

  // Estados para os inputs
  const [whatsapp, setWhatsapp] = useState('');
  const [telegram, setTelegram] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Estados para o fluxo de verificação
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para feedback ao usuário
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [onboardingSuccess, setOnboardingSuccess] = useState<string | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const getFriendlyErrorMessage = (error: any): string => {
    switch (error.code) {
        case 'auth/too-many-requests':
          return 'Muitas tentativas foram feitas com este número. Por favor, aguarde um momento antes de tentar novamente.';
        case 'auth/invalid-phone-number':
          return 'O número de telefone fornecido não é válido. Verifique e tente novamente no formato (XX) XXXXX-XXXX.';
        case 'auth/invalid-verification-code':
          return 'O código de verificação está incorreto. Por favor, verifique e tente novamente.';
        case 'auth/network-request-failed':
          return 'Falha na rede. Verifique sua conexão com a internet e tente novamente.';
        case 'auth/invalid-app-credential':
          return 'Ocorreu um erro de configuração (credencial inválida). Se o problema persistir, contate o suporte.';
        default:
          console.error("Onboarding Error:", error);
          return 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.';
      }
  };

  const clearMessages = () => {
    setOnboardingError(null);
    setOnboardingSuccess(null);
  };

  const formatAndValidatePhone = (rawPhone: string): string | null => {
    const cleanedPhone = rawPhone.replace(/\D/g, '');
    if (cleanedPhone.length >= 10 && cleanedPhone.length <= 11) {
      return `+55${cleanedPhone}`;
    }
    return null;
  };

  const handleSendCode = async () => {
    clearMessages();
    setIsSubmitting(true);
    const formattedPhone = formatAndValidatePhone(inputPhone);

    if (!formattedPhone) {
      setOnboardingError("Por favor, insira um número de telefone válido no formato (XX) XXXXX-XXXX.");
      setIsSubmitting(false);
      return;
    }
    
    setWhatsapp(formattedPhone);

    try {
      if (!recaptchaContainerRef.current) throw new Error("reCAPTCHA container is not available.");

      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, { 'size': 'invisible' });
      await recaptchaVerifier.render();
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      
      setConfirmationResult(confirmation);
      setIsCodeSent(true);
      setOnboardingSuccess("Código de verificação enviado! Confira seu WhatsApp ou SMS.");
    } catch (error: any) {
      setOnboardingError(getFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    clearMessages();
    if (!verificationCode || !confirmationResult) {
      setOnboardingError("Por favor, insira o código de verificação de 6 dígitos.");
      return;
    }
    setIsSubmitting(true);
    try {
      await confirmationResult.confirm(verificationCode);
      await finalizeOnboarding(true);
    } catch (error: any) {
      setOnboardingError(getFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const finalizeOnboarding = async (isPhoneVerified: boolean) => {
    if (!user) {
      setOnboardingError("Usuário não autenticado. Por favor, faça login novamente.");
      return;
    }
    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({ whatsapp, telegram, verified: isPhoneVerified }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao atualizar o perfil.');
      }
      
      setOnboardingSuccess("Cadastro finalizado com sucesso! Redirecionando...");
      // Redireciona para a página inicial após 2 segundos para o usuário ler a mensagem
      setTimeout(() => router.push("/"), 2000);

    } catch (error: any) {
      setOnboardingError(`Erro ao salvar seus dados: ${error.message}`);
    }
  };

  const handleOnboardingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isCodeSent) {
      handleSendCode();
    } else {
      handleVerifyCode();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f3eefe]">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-[spin_4s_linear_infinite] border-sanca"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f3eefe]">
      <main className="max-w-md w-full p-4">
        <div className="text-center mb-4">
          {firstName && <h1 className="text-2xl mb-1 font-semibold">Olá, {firstName}!</h1>}
          <h2 className="text-xl font-medium">Finalize seu cadastro</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm">
          <form className="p-4 space-y-4" onSubmit={handleOnboardingSubmit}>
            {/* Mensagem de Sucesso */}
            {onboardingSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative text-sm" role="alert">
                <span className="block sm:inline">{onboardingSuccess}</span>
              </div>
            )}
            {/* Mensagem de Erro */}
            {onboardingError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative text-sm" role="alert">
                <span className="block sm:inline">{onboardingError}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp (com DDD)*</label>
              <IMaskInput
                mask="(00) 00000-0000"
                id="whatsapp"
                name="whatsapp"
                value={inputPhone}
                onAccept={(value: string) => setInputPhone(value)}
                placeholder="(11) 99999-9999"
                className="flex h-10 w-full font-medium rounded-md border border-gray-300 p-3 text-sm"
                required
                type="tel"
                disabled={isCodeSent || isSubmitting}
              />
            </div>

            {isCodeSent && (
              <div className="space-y-2">
                <label htmlFor="verificationCode" className="text-sm font-medium">Código de Verificação</label>
                <input
                  type="text"
                  id="verificationCode"
                  name="verificationCode"
                  value={verificationCode}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value)}
                  placeholder="Seu código de 6 dígitos"
                  className="flex h-10 w-full font-medium rounded-md border border-gray-300 p-3 text-sm"
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="telegram" className="text-sm font-medium">Telegram (opcional)</label>
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
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="w-full h-10 px-3 py-2 rounded-md bg-sanca hover:bg-sanca/90 text-white text-sm font-medium disabled:bg-sanca/50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processando...' : (isCodeSent ? "Verificar e Finalizar" : "Enviar Código")}
            </button>
            <div id="recaptcha-container" ref={recaptchaContainerRef}></div>
          </form>

          <p className="text-xs pb-4 px-4 text-center text-gray-500">
            Estas informações serão usadas apenas para comunicação entre usuários. Nunca compartilharemos seus dados com terceiros.
          </p>
        </div>
      </main>
    </div>
  );
}