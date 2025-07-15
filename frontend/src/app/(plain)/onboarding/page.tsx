"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { RecaptchaVerifier, linkWithCredential, PhoneAuthProvider } from 'firebase/auth';
import { IMaskInput } from 'react-imask';
import api from '@/lib/api/axiosConfig';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function Onboarding() {
  const { user, loading, firstName } = useAuth();
  const router = useRouter();

  // Estados para os inputs
  const [telegram, setTelegram] = useState('');
  const [inputPhone, setInputPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Estados para o fluxo de verificação
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para feedback ao usuário
  const [onboardingError, setOnboardingError] = useState<string | null>(null);
  const [onboardingSuccess, setOnboardingSuccess] = useState<string | null>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Redireciona para a página de login se o usuário não estiver autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Função para obter mensagens de erro user-friendly
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
      case 'auth/credential-already-in-use':
      case 'auth/account-exists-with-different-credential':
        return 'Este número de telefone já está associado a outra conta. Use um número diferente ou contate o suporte.';
      default:
        console.error("Onboarding Error:", error);
        return 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.';
    }
  };

  // Limpa mensagens de sucesso e erro
  const clearMessages = () => {
    setOnboardingError(null);
    setOnboardingSuccess(null);
  };

  // Formata o número de telefone para o padrão E.123 (usado pelo Firebase)
  // Exemplo: (11) 99999-9999 -> +5511999999999
  const formatPhoneE123 = (rawPhone: string): string | null => {
    const cleanedPhone = rawPhone.replace(/\D/g, '');
    if (cleanedPhone.length >= 10 && cleanedPhone.length <= 11) {
      return `+55${cleanedPhone}`;
    }
    return null;
  };

  // Função para enviar o código de verificação
  const handleSendCode = async () => {
    clearMessages();
    setIsSubmitting(true);
    const formattedPhone = formatPhoneE123(inputPhone);

    if (!user) {
      setOnboardingError("Usuário não está autenticado. Por favor, faça login novamente.");
      setIsSubmitting(false);
      return;
    }

    if (!formattedPhone) {
      setOnboardingError("Por favor, insira um número de telefone válido no formato (XX) XXXXX-XXXX.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (!recaptchaContainerRef.current) throw new Error("reCAPTCHA container is not available.");

      const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerRef.current, { 'size': 'invisible' });
      window.recaptchaVerifier = recaptchaVerifier;
      
      const phoneProvider = new PhoneAuthProvider(auth);
      const verId = await phoneProvider.verifyPhoneNumber(formattedPhone, recaptchaVerifier);
      
      setVerificationId(verId);
      setIsCodeSent(true);
      setOnboardingSuccess("Código de verificação enviado! Confira seu WhatsApp ou SMS.");
    } catch (error: any) {
      setOnboardingError(getFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para finalizar o onboarding
  const finalizeOnboarding = async (isPhoneVerified: boolean) => {
    if (!user) {
      throw new Error("Usuário não autenticado. Por favor, faça login novamente.");
    }
    const idToken = await user.getIdToken();
    const dbWhatsapp = inputPhone.replace(/\D/g, '');

    const response = await api.put(`/profile/${user.uid}`, {
      whatsapp: `55${dbWhatsapp}`,
      telegram,
      verified: isPhoneVerified,
    }, {
      headers: {
        'Authorization': `Bearer ${idToken}`,
      },
    });

    if (response.status !== 200) {
      const errorData = response.data;
      throw new Error(errorData.error || 'Falha ao atualizar o perfil.');
    }
  };

  // Função para verificar o código de verificação
  const handleVerifyCode = async () => {
    clearMessages();
    if (!verificationCode || !verificationId || !user) {
      setOnboardingError("Por favor, insira o código de 6 dígitos.");
      return;
    }
    setIsSubmitting(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      await linkWithCredential(user, credential);
      await finalizeOnboarding(true);
      
      setOnboardingSuccess("Cadastro finalizado com sucesso! Redirecionando...");
      setTimeout(() => {
        router.push("/");
      }, 2000);

    } catch (error: any) {
      setOnboardingError(getFriendlyErrorMessage(error));
      setIsSubmitting(false); // Reativa o botão apenas em caso de erro
    }
  };

  // Função para lidar com o envio do formulário
  const handleOnboardingSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isCodeSent) {
      handleSendCode();
    } else {
      handleVerifyCode();
    }
  };

  // Renderiza um spinner enquanto os dados do usuário estão sendo carregados
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
            {onboardingSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md text-sm" role="alert">
                <span>{onboardingSuccess}</span>
              </div>
            )}
            {onboardingError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm" role="alert">
                <span>{onboardingError}</span>
              </div>
            )}

            {!isCodeSent ? (
              <>
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
                    disabled={isSubmitting}
                  />
                </div>

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
              </>
            ) : (
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
                  maxLength={6}
                />
              </div>
            )}

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