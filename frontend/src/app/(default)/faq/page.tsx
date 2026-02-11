"use client"

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQ() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const faqs = [
    {
      question: "Como funciona o Sanca Brechó?",
      answer:
        "O Sanca Brechó é uma plataforma digital que facilita o contato entre universitários de São Carlos interessados em comprar e vender produtos usados. Importante: o Sanca Brechó não participa da negociação, pagamento ou entrega dos produtos anunciados, atuando apenas como um intermediador.",
    },
    {
      question: "Como posso anunciar um produto?",
      answer:
        'Para anunciar um produto, você deve estar cadastrado na plataforma. Após realizar o login, clique em "Anunciar" no menu superior, preencha todas as informações necessárias e publique seu anúncio.',
    },
    {
      question: "Como entro em contato com o vendedor?",
      answer:
        "Na página do produto, há um botão que direciona para o WhatsApp do vendedor. Você também pode visualizar o perfil do vendedor para verificar outras formas de contato.",
    },
    {
      question: "O site cobra alguma taxa?",
      answer:
        "Não. O Sanca Brechó é um serviço gratuito para universitários de São Carlos, sem cobranças por anúncios ou transações.",
    },
    {
      question: "Como avaliar um vendedor?",
      answer:
        "Após finalizar uma negociação, acesse o perfil do usuário e deixe sua avaliação sobre a experiência.",
    },
    {
      question: "Posso reservar um produto?",
      answer:
        "A reserva deve ser combinada diretamente entre comprador e vendedor. Recomendamos que os termos da reserva sejam claramente definidos, incluindo o prazo de validade.",
    },
    {
      question: "O que fazer se um produto apresentar problemas?",
      answer:
        "O Sanca Brechó não se responsabiliza pela qualidade ou estado dos produtos anunciados. Recomendamos que a inspeção seja realizada antes de qualquer pagamento e que a comunicação entre as partes seja clara e respeitosa.",
    },
  ];

  return (
    <div className="min-h-[75vh] flex flex-col">
      <main className="flex-grow py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Perguntas Frequentes</h1>
            {faqs.map((faq, index) => {
              const isOpen = openIndexes.includes(index);
              return (
                <div
                  key={index}
                  className="border-b border-gray-300 py-4 transition-all duration-300"
                >
                  <button
                    type="button"
                    onClick={() => toggleIndex(index)}
                    className="w-full flex justify-between items-center text-left cursor-pointer font-medium hover:underline focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="mt-2">{faq.answer}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
