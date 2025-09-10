"use client";

import { getAllUsers, deleteUser, getMe } from "@/lib/services/userService";
import { getListings } from "@/lib/services/listingService";
import { getCategories } from "@/lib/services/categoryService";
import { getReports } from "@/lib/services/reportService";
import { UserType, ListingType, CategoryType, ReportType } from "@/lib/types/api";
import { Users, LayoutGrid, Tag, ShieldAlert, Trash2, Edit, UserCog, PlusCircle, ArrowLeft, MoreHorizontalIcon, MoreHorizontal } from "lucide-react";
import { useEffect, useState } from "react";

import { CategoryModal, ModalState as CategoryModalState } from "@/app/components/categoryModal";
import { UserRoleModal, UserModalState } from "@/app/components/userRoleModal";
import { ListingDeleteModal, ListingModalState } from "@/app/components/listingDeleteModal";
import { ReportActionModal, ReportModalState } from "@/app/components/reportActionModal";
import { useAuth } from "@/lib/context/AuthContext";
import { showErrorToast } from "@/lib/toast";
import router from "next/router";
import SafeImage from "@/app/components/safeImage";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [listings, setListings] = useState<ListingType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [reports, setReports] = useState<ReportType[]>([]);

  const [categoryModalState, setCategoryModalState] = useState<CategoryModalState>(null);
  const [userModalState, setUserModalState] = useState<UserModalState>(null);
  const [listingModalState, setListingModalState] = useState<ListingModalState>(null);
  const [reportModalState, setReportModalState] = useState<ReportModalState>(null);

  const refetchUsers = async () => setUsers(await getAllUsers());
  const refetchListings = async () => setListings(await getListings());
  const refetchCategories = async () => setCategories(await getCategories());
  const refetchReports = async () => {
    const reportsData = await getReports(1, 10, 'open');
    setReports(reportsData.reports);
  };

  // Verifica se o usuário é um administrador
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [usersData, listingsData, categoriesData, reportsData] =
          await Promise.all([
            getAllUsers(),
            getListings(),
            getCategories(),
            getReports(1, 10, 'open'),
          ]);
        setUsers(usersData);
        setListings(listingsData);
        setCategories(categoriesData);
        setReports(reportsData.reports);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        alert("Falha ao carregar os dados do painel. Verifique o console.");
      }
    };

    const checkAdminStatus = async () => {
      if (authLoading) return;
      if (!firebaseUser) {
        showErrorToast("Acesso negado.");
        router.push("/");
        return;
      }

      try {
        const userProfile = await getMe();
        if (userProfile.role !== 'admin') {
          showErrorToast("Você não tem permissão para acessar esta página.");
          router.push("/");
        }
        fetchAllData();
      } catch {
        showErrorToast("Erro ao verificar permissões.");
        router.push("/");
      }
    };

    checkAdminStatus();
  }, [firebaseUser, authLoading]);

  const handleDeleteUser = async (userSlug: string) => {
    if (confirm("Tem certeza que deseja deletar este usuário? Esta ação é irreversível.")) {
      try {
        await deleteUser(userSlug);
        refetchUsers();
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        alert("Falha ao deletar usuário.");
      }
    }
  };

  const stats = {
    totalUsers: users.length,
    totalListings: listings.length,
    listingsSold: listings.filter(listing => listing.status === 'sold').length,
    pendingReports: reports.length || 0,
  };

  return (
    <>
      <main className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          <Link href="/" className="text-gray-500 hover:text-sanca flex items-center text-sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para o site
          </Link>
          Painel Administrativo
        </h1>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <Users className="w-8 h-8 text-sanca" />
            <div><p className="text-3xl font-bold">{stats.totalUsers}</p><p className="text-gray-500">Usuários Totais</p></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <LayoutGrid className="w-8 h-8 text-sanca" />
            <div><p className="text-3xl font-bold">{stats.totalListings}</p><p className="text-gray-500">Anúncios Totais</p></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <Tag className="w-8 h-8 text-sanca" />
            <div><p className="text-3xl font-bold">{stats.listingsSold}</p><p className="text-gray-500">Anúncios Vendidos</p></div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
            <ShieldAlert className="w-8 h-8 text-red-500" />
            <div><p className="text-3xl font-bold">{stats.pendingReports}</p><p className="text-gray-500">Denúncias Pendentes</p></div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Gerenciamento de Anúncios</h2>
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="border-b-2 border-gray-100"><tr>
              <th className="p-3 font-semibold text-gray-600">Título</th>
              <th className="p-3 font-semibold text-gray-600">Preço</th>
              <th className="p-3 font-semibold text-gray-600">Data</th>
              <th className="p-3 font-semibold text-gray-600">Vendedor</th>
              <th className="p-3 font-semibold text-gray-600 text-center">Ações</th>
            </tr></thead>
            <tbody>{listings.map((listing) => (
              <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  <Link href={`/produto/${listing.slug}`} className="text-blue-600 hover:underline line-clamp-4">
                    {listing.title}
                  </Link>
                </td>
                <td className="p-3">R$ {listing.price.toFixed(2)}</td>
                <td className="p-3">{new Date(listing.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">
                  {listing.user.display_name}
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => setListingModalState({ listing })} className="text-red-500 hover:text-red-700 p-1 cursor-pointer" title="Deletar Anúncio">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h2>
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="border-b-2 border-gray-100"><tr>
              <th className="p-3 font-semibold text-gray-600">Foto</th>
              <th className="p-3 font-semibold text-gray-600">Nome</th>
              <th className="p-3 font-semibold text-gray-600">Email</th>
              <th className="p-3 font-semibold text-gray-600">Verificado</th>
              <th className="p-3 font-semibold text-gray-600">Cargo</th>
              <th className="p-3 font-semibold text-gray-600 text-center">Ações</th>
            </tr></thead>
            <tbody>{users.map((user, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3 flex items-center gap-3">
                  <SafeImage src={user.photo_url || "/default-avatar.png"} alt={user.display_name} fallbackSrc="/user_placeholder.png" className="w-9 h-9 rounded-full object-cover" width={96} height={96} />
                </td>
                <td className="p-3">
                  <Link href={`/usuario/${user.slug}`} className="text-blue-600 hover:underline">
                    {user.display_name}
                  </Link>
                </td>
                <td className="p-3">{user.email}</td>
                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{user.verified ? "Sim" : "Não"}</span></td>
                <td className="p-3"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>{user.role}</span></td>
                <td className="p-3 flex gap-2 justify-center">
                  <button onClick={() => handleDeleteUser(user.slug)} className="text-red-500 hover:text-red-700 p-1 cursor-pointer" title="Deletar Usuário"><Trash2 className="w-5 h-5" /></button>
                  <button onClick={() => setUserModalState({ user })} className="text-blue-500 hover:text-blue-700 p-1 cursor-pointer" title="Alterar Cargo"><UserCog className="w-5 h-5" /></button>
                </td>
              </tr>
            ))}</tbody>
          </table></div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Categorias</h2>
              <button onClick={() => setCategoryModalState({ type: "add" })} className="bg-sanca text-white px-3 py-1.5 rounded-md flex items-center gap-2 hover:opacity-90 text-sm font-medium cursor-pointer">
                <PlusCircle className="w-4 h-4" /> Nova Categoria
              </button>
            </div>
            <ul className="space-y-2">{categories.map((cat) => (
              <li key={cat.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-md hover:bg-gray-50">
                <span className="flex items-center gap-3">
                  <div>
                    {cat.name}
                  </div>
                  <div>
                    {cat.icon}
                  </div>
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setCategoryModalState({ type: "edit", category: cat })} className="text-blue-500 hover:text-blue-700 cursor-pointer"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => setCategoryModalState({ type: "delete", category: cat })} className="text-red-500 hover:text-red-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                </div>
              </li>
            ))}</ul>
          </section>

          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Denúncias Pendentes
              <Link href="/admin/denuncias" className="text-gray-500 hover:text-sanca flex items-center text-sm">
                Ver mais detalhes
              </Link>
            </h2>
            <ul className="space-y-3">{reports.length > 0 ? (reports.map((report) => (
              <li key={report.id} className="p-3 border border-gray-100 rounded-md">
                <p className="font-semibold">{report.reason}</p>
                <p className="text-sm text-gray-600">Denunciando: {report.target_type} ({report.target_name})</p>
                <div className="mt-2">
                  <button onClick={() => setReportModalState({ report })} className="text-sm bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 cursor-pointer">
                    Analisar Denúncia
                  </button>
                </div>
              </li>
            ))) : (
              <li className="p-3 text-gray-500">Nenhuma denúncia pendente</li>
            )}</ul>
          </section>
        </div>
      </main>

      <CategoryModal
        modalState={categoryModalState}
        setModalState={setCategoryModalState}
        refetchCategories={refetchCategories}
      />
      <ListingDeleteModal
        modalState={listingModalState}
        setModalState={setListingModalState}
        refetchListings={refetchListings}
      />
      <UserRoleModal
        modalState={userModalState}
        setModalState={setUserModalState}
        refetchUsers={refetchUsers}
      />
      <ReportActionModal
        modalState={reportModalState}
        setModalState={setReportModalState}
        refetchReports={refetchReports}
      />
    </>
  );
}