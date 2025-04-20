'use client'

import "@/styles/globals.css"

export default function Anunciar() {
    return (
        <div className="min-h-screen flex flex-col">
            <section className="max-w-3xl mb-15 mx-auto" >
                <h3 className="text-xl font-bold text-left mt-15 mb-3">Anunciar um Produto</h3>
                <div className="bg-white rounded-xl shadow-sm  p-6">
                    <form className="space-y-4">

                        <div className="space-y-1">
                            <label className="text-sm font-medium block" htmlFor="title">Título do anúncio</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Ex: Livro de Cálculo Vol.1 Thomas"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium block" htmlFor="description">Descrição detalhada</label>
                            <textarea
                                name="description"
                                id="description"
                                className="w-full border border-gray-300 rounded-md p-2 text-sm h-24 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Descreva detalhes importantes sobre o produto, como estado, marca, modelo, etc."
                                required
                            ></textarea>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium block" htmlFor="price">Preço (R$)*</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="R$ 0.00"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label htmlFor="category" className="text-sm font-medium block">Categoria*</label>
                                <select
                                    id="category"
                                    name="category"
                                    defaultValue="defaultValue"
                                    className="border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                    required
                                >
                                    <option value="defaultValue" disabled>Selecione</option>
                                    <option value="books">📚 Livros</option>
                                    <option value="eletronics">💻 Eletrônicos</option>
                                    <option value="furnitures">🪑 Móveis</option>
                                    <option value="transport">🚲 Transporte</option>
                                    <option value="clothes">👕 Roupas</option>
                                    <option value="music">🎸 Música</option>
                                    <option value="sports">⚽️ Esportes</option>
                                    <option value="games">🎮 Jogos</option>
                                </select>

                                <div className="mt-6">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-300 peer-checked:bg-gray-600 dark:peer-checked:bg-blue-600"></div>
                                        <span className="ms-3 text-sm font-medium">Preço negociavel</span>
                                    </label>
                                </div>

                            </div>

                            <div className="space-y-1">
                                <label htmlFor="condition" className="text-sm font-medium block">Condição*</label>
                                <select
                                    name="condition"
                                    id="condition"
                                    defaultValue="defaultValue"
                                    className=" border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="defaultValue" disabled>Selecione</option>
                                    <option value="new">Novo</option>
                                    <option value="usedLikeANew">Usado - Como novo</option>
                                    <option value="usedLikeGood">Usado - Bom estado</option>
                                    <option value="usedLikeBad">UsadoCom marcas</option>
                                </select>

                                <div className="mt-6">
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" />
                                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-300 peer-checked:bg-gray-600 dark:peer-checked:bg-blue-600"></div>
                                        <span className="ms-3 text-sm font-medium">Preço negociavel</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium">Imagens do produto* (máximo 5)</label>
                            <div className='grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-4'>
                                <div className="aspect-square border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center p-2 w-30 h-30">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-gray-400"
                                    >
                                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                                        <circle cx="12" cy="13" r="3"></circle>
                                    </svg>
                                    <label className='text-center' htmlFor="image-upload">
                                        <span className="cursor-pointer text-indigo-600 text-sm">Adicionar foto</span>
                                        <input id="image-upload" className='hidden' accept="image/*" type="file" required/>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="text-sm text-gray-500 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-upload h-4 w-4 mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
                            A primeira imagem será a capa do seu anúncio
                        </div>

                        <div className="mb-6">
                            <label htmlFor="phone" className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium">WhatsApp para contato*</label>
                            <input id="phone" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" placeholder="(16)9999-9999" type="tel" />
                        </div>

                        <div className="flex flex-col space-y-4">
                            <div className="flex items-start space-x-2">
                                <div className="mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-check h-4 w-4 text-green-500"><circle cx="12" cy="12" r="10"></circle><path d="m9 12 2 2 4-4"></path></svg>
                                </div>
                                <p className="text-sm text-gray-500">Seu anúncio estará visível para todos imediatamente após a publicação</p>
                            </div>
                            <div className="flex items-start space-x-2">
                                <div className="mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-alert h-4 w-4 text-yellow-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line></svg>
                                </div>
                                <p className="text-sm text-gray-500">Lembre-se de que você é responsável pelo contato, negociação e entrega do produto.</p>
                            </div>
                            <button type="submit" className=" cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm text-white font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground h-10 px-4 py-2 w-full bg-indigo-500 hover:bg-indigo-400">
                                Publicar Anúncio
                            </button>
                        </div>

                    </form>
                </div>
            </section>
        </div>
    );
}


