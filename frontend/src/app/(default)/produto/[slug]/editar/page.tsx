"use client"

import Link from "next/link";
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Upload, X, Save, Eye } from "lucide-react";

type EditProductProps = {
  product: {
    id: number;
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    location: string;
    createdAt: string;
    images: string[];
    userId: number;
    userName: string;
    userAvatar: string;
    phone: string;
    views: number;
  };
};

export default function EditarProdutoClient() {
  const { id } = useParams<{ id: string }>()
  
  const originalProduct = {
    id: parseInt(id),
    title: "Macbook Air 2020",
    description: "Macbook Air 2020 com M1.\nUsado, mas em ótimo estado. \nAcompanha carregador e caixa original.",
    price: 3999.99,
    category: "Eletrônicos",
    condition: "Usado",
    location: "São Carlos, SP",
    createdAt: new Date().toISOString(),
    images: ["https://picsum.photos/id/0/1280/900", 
              "https://picsum.photos/id/2/1280/900",
              "https://picsum.photos/id/9/1280/900",
              "https://picsum.photos/id/5/1280/900",
              "https://picsum.photos/id/6/1280/900",
            ],
    userId: 1,
    userName: "João Silva",
    userAvatar: "https://placehold.co/50x50.jpg",
    phone: "+5511999999999",
    views: 100,
  };

  const [formData, setFormData] = useState({
    title: originalProduct.title,
    description: originalProduct.description,
    price: originalProduct.price,
    category: originalProduct.category,
    condition: originalProduct.condition,
  });

  const [images, setImages] = useState(originalProduct.images);
  const [isLoading] = useState(false);

  if (!originalProduct) {
    notFound()
  }

  const categories = [
    "Eletrônicos",
    "Roupas e Acessórios",
    "Casa e Jardim",
    "Livros",
    "Esportes",
    "Veículos",
    "Móveis",
    "Outros"
  ];

  const conditions = [
    "Novo",
    "Semi-novo",
    "Usado",
    "Para reparo"
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value
    }));
  };

  const handleImageRemove = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageAdd = () => {
};

  const handleSubmit = async (e: React.FormEvent) => {
};

  const handlePreview = () => {
    window.open(`/produto/${id}`, '_blank');
};

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pb-10">
        <div className="container mx-auto px-4">
          <div className="py-4">
            <Link href={`/produto/${id}`} className="text-gray-500 hover:text-sanca flex items-center text-sm">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar para o produto
            </Link>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
                <p className="text-gray-500">ID: {originalProduct.id}</p>
              </div>
              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                Visualizar
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Imagens do Produto</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={image}
                        alt={`Produto ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 10 && (
                    <button
                      type="button"
                      onClick={handleImageAdd}
                      className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-sanca hover:border-sanca transition-colors"
                    >
                      <Upload className="h-6 w-6 mb-2" />
                      <span className="text-sm">Adicionar</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Máximo de 10 imagens. Primeira imagem será a principal.
                </p>
              </div>              
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Produto *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent"
                    placeholder="Ex: iPhone 12 Pro Max 128GB"
                  />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                    Condição *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent"
                  >
                    {conditions.map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sanca focus:border-transparent resize-vertical"
                    placeholder="Descreva seu produto em detalhes..."
                  />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Informações do Vendedor</h4>
                  <div className="flex items-center gap-3">
                    <Image
                      width={40}
                      height={40}
                      src={originalProduct.userAvatar}
                      alt={originalProduct.userName}
                      className="rounded-full"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{originalProduct.userName}</p>
                      <p className="text-sm text-gray-500">{originalProduct.location}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Link href={`/produto/${id}`} className="flex-1">
                    <button
                      type="button"
                      className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </Link>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-sanca text-white rounded-md hover:bg-sanca/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Salvar Alterações
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}