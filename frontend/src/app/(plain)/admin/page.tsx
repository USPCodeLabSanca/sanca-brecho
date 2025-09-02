"use client";

import { Users, LayoutGrid, Tag, ShieldAlert, Trash2, Edit, UserCog, PlusCircle,} from "lucide-react";

const mockUsers = [
  { id: '1', name: 'Ana Silva', email: 'ana.silva@email.com', profilePicture: 'https://i.pravatar.cc/150?u=ana', role: 'ADMIN' },
  { id: '2', name: 'Bruno Costa', email: 'bruno.costa@email.com', profilePicture: 'https://i.pravatar.cc/150?u=bruno', role: 'USER' },
  { id: '3', name: 'Carla Dias', email: 'carla.dias@email.com', profilePicture: 'https://i.pravatar.cc/150?u=carla', role: 'USER' },
];

const mockListings = [
  { id: 'l1', title: 'Cadeira de Escritório Ergonômica', user: { name: 'Ana Silva' }, price: 150.00, createdAt: '2025-08-14T10:00:00Z' },
  { id: 'l2', title: 'Livro de Cálculo Vol. 1', user: { name: 'João Costa' }, price: 50.00, createdAt: '2025-08-13T12:30:00Z' },
  { id: 'l3', title: 'Monitor Dell 24"', user: { name: 'Mariana Oliveira' }, price: 400.00, createdAt: '2025-08-12T15:00:00Z' },
  { id: 'l4', title: 'Teclado Mecânico Redragon', user: { name: 'Bruno Costa' }, price: 220.00, createdAt: '2025-08-11T18:45:00Z' },
];

const mockCategories = [
    { id: 'c1', name: 'Eletrônicos'},
    { id: 'c2', name: 'Móveis'},
    { id: 'c3', name: 'Livros e Materiais'},
    { id: 'c4', name: 'Vestuário'},
];

const mockReports = [
    { id: 'r1', reason: 'Anúncio Falso', reportedItem: { type: 'LISTING', id: 'l3' }, status: 'PENDING' },
    { id: 'r2', reason: 'Foto de Perfil Inapropriada', reportedItem: { type: 'USER', id: '3' }, status: 'PENDING' },
];



export default function AdminDashboardPage() {
  
  // As estatísticas são calculadas diretamente dos dados falsos
  const stats = {
    totalUsers: mockUsers.length,
    totalListings: mockListings.length,
    listingsSold: 12, // Um valor estático para exemplo
    pendingReports: mockReports.filter(r => r.status === 'PENDING').length,
  };
  
  return (
    <main className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Painel Administrativo</h1>

      {/* Seção de Estatísticas */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <Users className="w-8 h-8 text-sanca"/>
            <div>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-gray-500">Usuários Totais</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <LayoutGrid className="w-8 h-8 text-sanca"/>
            <div>
                <p className="text-3xl font-bold">{stats.totalListings}</p>
                <p className="text-gray-500">Anúncios Totais</p>
            </div>
        </div>
         <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <Tag className="w-8 h-8 text-sanca"/>
            <div>
                <p className="text-3xl font-bold">{stats.listingsSold}</p>
                <p className="text-gray-500">Anúncios Vendidos</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 text-red-500"/>
            <div>
                <p className="text-3xl font-bold">{stats.pendingReports}</p>
                <p className="text-gray-500">Denúncias Pendentes</p>
            </div>
        </div>
      </section>

      {/* Gerenciamento de Anúncios */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Gerenciamento de Anúncios</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-gray-100">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Título</th>
                <th className="p-3 font-semibold text-gray-600">Vendedor</th>
                <th className="p-3 font-semibold text-gray-600">Preço</th>
                <th className="p-3 font-semibold text-gray-600">Data</th>
                <th className="p-3 font-semibold text-gray-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockListings.map(listing => (
                <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">{listing.title}</td>
                  <td className="p-3">{listing.user.name}</td>
                  <td className="p-3">R$ {listing.price.toFixed(2)}</td>
                  <td className="p-3">{new Date(listing.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 text-center">
                    <button className="text-red-500 hover:text-red-700 p-1">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Gerenciamento de Usuários */}
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-gray-100">
              <tr>
                <th className="p-3 font-semibold text-gray-600">Nome</th>
                <th className="p-3 font-semibold text-gray-600">Email</th>
                <th className="p-3 font-semibold text-gray-600">Cargo</th>
                <th className="p-3 font-semibold text-gray-600 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 flex items-center gap-3">
                    <img src={user.profilePicture || '/default-avatar.png'} alt={user.name} className="w-9 h-9 rounded-full object-cover"/>
                    {user.name}
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3 flex gap-2 justify-center">
                    <button className="text-red-500 hover:text-red-700 p-1" title="Remover Foto">
                      <Trash2 className="w-5 h-5"/>
                    </button>
                    <button className="text-blue-500 hover:text-blue-700 p-1" title="Alterar Cargo">
                      <UserCog className="w-5 h-5"/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      
      {/* Seção de Categorias e Denúncias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gerenciamento de Categorias */}
        <section className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Categorias</h2>
                <button className="bg-sanca text-white px-3 py-1.5 rounded-md flex items-center gap-2 hover:opacity-90 text-sm font-medium">
                    <PlusCircle className="w-4 h-4"/> Nova Categoria
                </button>
            </div>
            <ul className="space-y-2">
                {mockCategories.map(cat => (
                    <li key={cat.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-md hover:bg-gray-50">
                        <span className="flex items-center gap-3"><span className="text-xl"></span> {cat.name}</span>
                        <div className="flex gap-2">
                            <button className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4"/></button>
                            <button className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>

        {/* Gerenciamento de Denúncias */}
        <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Denúncias Pendentes</h2>
             <ul className="space-y-3">
                {mockReports.map(report => (
                    <li key={report.id} className="p-3 border border-gray-100 rounded-md">
                        <p className="font-semibold">{report.reason}</p>
                        <p className="text-sm text-gray-600">Denunciando: {report.reportedItem.type} (ID: {report.reportedItem.id})</p>
                        <div className="mt-2">
                            <button className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600">
                                Marcar como Resolvido
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
      </div>

    </main>
  );
}