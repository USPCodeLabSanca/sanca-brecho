"use client";

import { CheckCircle, Clock, MessageCircle, Search, Upload, User } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { Button } from "@/app/components/button";

export default function ComoFunciona() {
  const { user, loading } = useAuth();

  const steps = [
    {
      icon: <User className="h-10 w-10 text-sanca" />,
      title: "Crie sua conta",
      description: "Registre-se usando seu e-mail universitário para ter acesso a todas as funcionalidades da plataforma."
    },
    {
      icon: <Upload className="h-10 w-10 text-sanca" />,
      title: "Anuncie seus produtos",
      description: "Tire fotos do seu produto, descreva-o detalhadamente, defina o preço e publique o anúncio."
    },
    {
      icon: <Search className="h-10 w-10 text-sanca" />,
      title: "Encontre o que procura",
      description: "Navegue pelos anúncios, filtre por categorias e encontre produtos próximos de você."
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-sanca" />,
      title: "Entre em contato",
      description: "Use o WhatsApp ou outras formas de contato para negociar diretamente com o vendedor ou comprador."
    },
    {
      icon: <Clock className="h-10 w-10 text-sanca" />,
      title: "Combine a entrega",
      description: "Defina com a outra parte o local e horário para realizar a troca do produto."
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-sanca" />,
      title: "Conclua a negociação",
      description: "Finalize a compra ou venda e avalie sua experiência para ajudar outros usuários."
    }
  ];

  return(
  <div className="flex flex-col">
    <main className="flex-grow py-10">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Como funciona</h1>
      <p className="text-lg text-gray-600 mb-12 text-center">
        Conheça como utilizar o Sanca Brechó para comprar e vender produtos usados de forma fácil e segura
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {steps.map((step, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start">
          <div className="mr-4">
            {step.icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
            <p className="text-gray-600">{step.description}</p>
          </div>
          </div>
        </div>
        ))}
      </div>
      
      {!loading && <div className="bg-[#f3eefe] rounded-xl p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pronto para começar?</h2>
        <p className="text-gray-700 mb-6">
        {user ? "Anuncie seu primeiro produto agora mesmo!" : "Crie sua conta e anuncie seu primeiro produto agora mesmo!"}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
        {user ? 
          <Button href="/anunciar">
            Anunciar produto
          </Button>
        :
          <Button href="/login">
            Criar conta
          </Button>
        }
        </div>
      </div>
      }
      </div>
    </div>
    </main>
  </div>
  );
}