"use client";

import { getUsers, deleteUser, getMe } from "@/lib/services/userService";
import { getListings } from "@/lib/services/listingService";
import { getCategories } from "@/lib/services/categoryService";
import { getReports } from "@/lib/services/reportService";
import { UserType, ListingType, CategoryType, ReportType, PaginationType } from "@/lib/types/api";
import { Users, LayoutGrid, Tag, ShieldAlert, Trash2, Edit, UserCog, PlusCircle, ArrowLeft } from "lucide-react";
import { useEffect, useState, useCallback } from "react";

import { CategoryModal, ModalState as CategoryModalState } from "@/app/components/categoryModal";
import { UserRoleModal, UserModalState } from "@/app/components/userRoleModal";
import { ListingDeleteModal, ListingModalState } from "@/app/components/listingDeleteModal";
import { ReportActionModal, ReportModalState } from "@/app/components/reportActionModal";
import { useAuth } from "@/lib/context/AuthContext";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import router from "next/router";
import SafeImage from "@/app/components/safeImage";
import Link from "next/link";
import Pagination from "@mui/material/Pagination";
import { Button } from "@/app/components/button";

export default function AdminDashboardPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageUser, setPageUser] = useState(1);
  const [pageSizeUser] = useState(20);

  const [listings, setListings] = useState<ListingType[]>([]);
  const [totalListings, setTotalListings] = useState(0);
  const [pageListing, setPageListing] = useState(1);
  const [pageSizeListing] = useState(20);

  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [reports, setReports] = useState<ReportType[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [pageReport, setPageReport] = useState(1);
  const [pageSizeReport] = useState(20);

  const [categoryModalState, setCategoryModalState] = useState<CategoryModalState>(null);
  const [userModalState, setUserModalState] = useState<UserModalState>(null);
  const [listingModalState, setListingModalState] = useState<ListingModalState>(null);
  const [reportModalState, setReportModalState] = useState<ReportModalState>(null);

  // Verifica se o usuário é um administrador
  useEffect(() => {
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
      } catch {
        showErrorToast("Erro ao verificar permissões.");
        router.push("/");
      }
    };

    checkAdminStatus();
  }, [firebaseUser, authLoading]);

  const fetchAllData = useCallback(async () => {
    try {
      const [usersResponse, listingsResponse, categoriesData, reportsResponse]:
        [PaginationType<UserType>, PaginationType<ListingType>, CategoryType[], PaginationType<ReportType>] =
        await Promise.all([
          getUsers(),
          getListings(),
          getCategories(),
          getReports(1, 10, 'open'),
        ]);

      setUsers(usersResponse.data);
      setTotalUsers(usersResponse.total);
      setListings(listingsResponse.data);
      setTotalListings(listingsResponse.total);
      setCategories(categoriesData);
      setReports(reportsResponse.data);
      setTotalReports(reportsResponse.total);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
      alert("Falha ao carregar os dados do painel. Verifique o console.");
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const usersResponse = await getUsers(pageUser, pageSizeUser);
      setUsers(usersResponse.data);
      setTotalUsers(usersResponse.total);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      alert("Falha ao carregar os usuários. Verifique o console.");
    }
  }, [pageUser, pageSizeUser]);

  const fetchListings = useCallback(async () => {
    try {
      const listingsResponse = await getListings(pageListing, pageSizeListing);
      setListings(listingsResponse.data);
      setTotalListings(listingsResponse.total);
    } catch (error) {
      console.error("Erro ao carregar anúncios:", error);
      alert("Falha ao carregar os anúncios. Verifique o console.");
    }
  }, [pageListing, pageSizeListing]);

  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      alert("Falha ao carregar as categorias. Verifique o console.");
    }
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      const reportsResponse = await getReports(pageReport, pageSizeReport, 'open');
      setReports(reportsResponse.data);
      setTotalReports(reportsResponse.total);
    } catch (error) {
      console.error("Erro ao carregar denúncias:", error);
      alert("Falha ao carregar as denúncias. Verifique o console.");
    }
  }, [pageReport, pageSizeReport]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Fetch users when pageUser or pageSizeUser changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Fetch listings when pageListing or pageSizeListing changes
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Fetch reports when pageReport or pageSizeReport changes
  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDeleteUser = async (userSlug: string) => {
    if (confirm("Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita.")) {
      try {
        await deleteUser(userSlug);
        showSuccessToast("Usuário deletado com sucesso.");
        fetchUsers();
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        showErrorToast("Falha ao deletar o usuário. Verifique o console.");
      }
    }
  };

  const stats = {
    totalUsers: totalUsers,
    totalListings: totalListings,
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
            <thead className="border-b-2 border-gray-100">
              <tr>
                <th className="p-3 text-left font-semibold text-gray-600">Título</th>
                <th className="p-3 text-left font-semibold text-gray-600">Preço</th>
                <th className="p-3 text-left font-semibold text-gray-600">Data</th>
                <th className="p-3 text-left font-semibold text-gray-600">Vendedor</th>
                <th className="p-3 text-center font-semibold text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 align-middle">
                    <Link href={`/produto/${listing.slug}`} className="text-blue-600 hover:underline line-clamp-4">
                      {listing.title}
                    </Link>
                  </td>
                  <td className="p-3 align-middle">R$ {listing.price.toFixed(2)}</td>
                  <td className="p-3 align-middle">{new Date(listing.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3 align-middle">
                    {listing.user.display_name}
                  </td>
                  <td className="p-3 text-center align-middle">
                    <Button onClick={() => setListingModalState({ listing })} variant="danger" title="Deletar Anúncio">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            <Pagination className="mt-4 w-full" count={Math.ceil(totalListings / pageSizeListing)} page={pageListing} onChange={(_, value) => setPageListing(value)} color="primary" />
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-2xl font-bold mb-4">Gerenciamento de Usuários</h2>
          <div className="overflow-x-auto"><table className="w-full text-left">
            <thead className="border-b-2 border-gray-100">
  <tr>
    <th className="p-3 text-left font-semibold text-gray-600">Foto</th>
    <th className="p-3 text-left font-semibold text-gray-600">Nome</th>
    <th className="p-3 text-left font-semibold text-gray-600">Email</th>
    <th className="p-3 text-left font-semibold text-gray-600">Verificado</th>
    <th className="p-3 text-left font-semibold text-gray-600">Cargo</th>
    <th className="p-3 text-center font-semibold text-gray-600">Ações</th>
  </tr>
</thead>
<tbody>
  {users.map((user, index) => (
    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
      <td className="p-3 align-middle">
        <div className="flex items-center gap-3">
          <SafeImage 
            src={user.photo_url || "/user_placeholder.png"} 
            alt={user.display_name} 
            fallbackSrc="/user_placeholder.png" 
            className="w-9 h-9 rounded-full object-cover" 
            width={96} 
            height={96} 
          />
        </div>
      </td>
      <td className="p-3 align-middle">
        <Link href={`/usuario/${user.slug}`} className="text-blue-600 hover:underline">
          {user.display_name}
        </Link>
      </td>
      <td className="p-3 align-middle">{user.email}</td>
      <td className="p-3 align-middle">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.verified ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {user.verified ? "Sim" : "Não"}
        </span>
      </td>
      <td className="p-3 align-middle">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"}`}>
          {user.role}
        </span>
      </td>
      <td className="p-3 align-middle">
        <div className="flex gap-2 justify-center items-center">
          <Button onClick={() => setUserModalState({ user })} variant="outline" title="Alterar Cargo">
            <UserCog className="w-4 h-4" />
          </Button>
          <Button onClick={() => handleDeleteUser(user.slug)} variant="danger" title="Deletar Usuário">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
          </table>
            <Pagination className="mt-4 w-full" count={Math.ceil(totalUsers / pageSizeUser)} page={pageUser} onChange={(_, value) => setPageUser(value)} color="primary" />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Categorias</h2>
              <Button onClick={() => setCategoryModalState({ type: "add" })}>
                <PlusCircle className="w-4 h-4" /> Nova Categoria
              </Button>
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
                  <Button onClick={() => setCategoryModalState({ type: "edit", category: cat })} variant="outline"><Edit className="w-4 h-4" /></Button>
                  <Button onClick={() => setCategoryModalState({ type: "delete", category: cat })} variant="danger"><Trash2 className="w-4 h-4" /></Button>
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
            <ul className="space-y-3">
              {reports.length > 0 ?
                (reports.map((report) => (
                  <li key={report.id} className="p-3 border border-gray-100 rounded-md">
                    <p className="font-semibold">{report.reason}</p>
                    <p className="text-sm text-gray-600">Denunciando: {report.target_type} ({report.target_name})</p>
                    <div className="mt-2">
                      <Button onClick={() => setReportModalState({ report })} variant="primary">
                        Analisar Denúncia
                      </Button>
                    </div>
                  </li>
                ))) : (
                  <li className="p-3 text-gray-500">Nenhuma denúncia pendente</li>
                )}
            </ul>
            <Pagination className="mt-4 w-full" count={Math.ceil(totalReports / pageSizeReport)} page={pageReport} onChange={(_, value) => setPageReport(value)} color="primary" />
          </section>
        </div>
      </main>

      <CategoryModal
        modalState={categoryModalState}
        setModalState={setCategoryModalState}
        refetchCategories={fetchCategories}
      />
      <ListingDeleteModal
        modalState={listingModalState}
        setModalState={setListingModalState}
        refetchListings={fetchListings}
      />
      <UserRoleModal
        modalState={userModalState}
        setModalState={setUserModalState}
        refetchUsers={fetchUsers}
      />
      <ReportActionModal
        modalState={reportModalState}
        setModalState={setReportModalState}
        refetchReports={fetchReports}
      />
    </>
  );
}