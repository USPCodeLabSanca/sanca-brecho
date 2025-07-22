"use client";

import { useState } from "react";
import { User, Mail, School, Calendar, Upload, Save } from "lucide-react";

const initialData = {
  name: "João Silva",
  email: "joao@ufscar.br",
  university: "UFSCar",
  bio: "Estudante de Engenharia de Computação na UFSCar. Vendo itens que não uso mais para economizar espaço no apartamento.",
  avatar: "https://i.pravatar.cc/150?img=1",
  memberSince: "14/03/2023",
};

export const EditProfileForm = () => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Dados salvos! (Simulação)\n" + JSON.stringify(formData, null, 2));
    // Aqui você faria a chamada para a API para salvar os dados
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Perfil</h1>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-4 relative">
              <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground absolute bottom-0 right-0 rounded-full p-1 h-8 w-8"
              >
                <Upload className="h-4 w-4" />
                <span className="sr-only">Upload avatar</span>
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Clique para alterar sua foto
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="name"
              className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium"
            >
              Nome Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <input
                value={formData.name}
                onChange={handleChange}
                id="name"
                name="name"
                placeholder="Seu nome completo"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm pl-10"
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="email"
              className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium"
            >
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Mail className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                id="email"
                name="email"
                placeholder="seu@email.com"
                disabled
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              O email não pode ser alterado
            </p>
          </div>

          <div className="mb-6">
            <label
              htmlFor="university"
              className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium"
            >
              Universidade
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <School className="h-4 w-4 text-gray-400" />
              </div>
              <input
                value={formData.university}
                onChange={handleChange}
                id="university"
                name="university"
                placeholder="USP, UFSCar, etc"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm pl-10"
              />
            </div>
          </div>

          <div className="mb-8">
            <label
              htmlFor="bio"
              className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium"
            >
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={handleChange}
              id="bio"
              name="bio"
              placeholder="Conte um pouco sobre você"
              rows={5}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            ></textarea>
          </div>

          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-500 mr-2" />
              <p className="text-sm text-gray-500">
                Membro desde {formData.memberSince}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-primary-foreground h-10 px-4 py-2 bg-sanca hover:bg-sanca/90"
            >
              <Save className="mr-2 h-4 w-4" />
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
