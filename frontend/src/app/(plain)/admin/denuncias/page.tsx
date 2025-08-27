"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, User, Package, XCircle, ChevronLeft, ChevronRight, Flag, ArrowLeft } from "lucide-react";

import { useAuth } from "@/lib/context/AuthContext";
import { getMe } from "@/lib/services/userService";
import { getReports, updateReportStatus } from "@/lib/services/reportService";
import { ReportType, UserType } from "@/lib/types/api";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import Spinner from "@/app/components/spinner";

export default function ReportsPage() {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open');
  const [reports, setReports] = useState<ReportType[]>([]);
  const [totalReports, setTotalReports] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingReports, setLoadingReports] = useState(true);

  const ITEMS_PER_PAGE = 5;
  const totalPages = Math.ceil(totalReports / ITEMS_PER_PAGE);

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
        setCurrentUser(userProfile);
        if (userProfile.role !== 'admin') {
          showErrorToast("Você não tem permissão para acessar esta página.");
          router.push("/");
        } else {
          setIsAdmin(true);
        }
      } catch (error) {
        showErrorToast("Erro ao verificar permissões.");
        router.push("/");
      }
    };

    checkAdminStatus();
  }, [firebaseUser, authLoading, router]);

  // Busca as denúncias paginadas sempre que a aba ou a página mudar
  useEffect(() => {
    if (!isAdmin) return;

    const fetchReports = async () => {
      setLoadingReports(true);
      try {
        const response = await getReports(currentPage, ITEMS_PER_PAGE, activeTab);
        
        setReports(response.reports);
        setTotalReports(response.total);
      } catch (error) {
        showErrorToast("Falha ao carregar as denúncias.");
        setReports([]);
        setTotalReports(0);
      } finally {
        setLoadingReports(false);
        setLoading(false);
      }
    };

    fetchReports();
  }, [isAdmin, activeTab, currentPage]);

  // Função para atualizar o status de uma denúncia
  const handleUpdateStatus = async (reportId: string, status: 'resolved' | 'rejected') => {
    try {
      const updatedReport = await updateReportStatus(reportId, status);

      setReports(prevReports =>
        prevReports.filter(report => report.id !== updatedReport.id)
      );
      showSuccessToast(`Denúncia marcada como "${status === 'resolved' ? 'Resolvida' : 'Rejeitada'}".`);
    } catch (error) {
      showErrorToast("Erro ao atualizar o status da denúncia.");
    }
  };

  // Converte o motivo da denúncia para texto legível
  const getReasonText = (reason: string) => {
    const reasons: { [key: string]: string } = {
      'fraude_golpe': 'Fraude ou Golpe',
      'proibido': 'Produto/Usuário Proibido',
      'info_falsa': 'Informações Falsas',
      'outro': 'Outro'
    };
    return reasons[reason] || reason;
  };
  
  // Trava a navegação entre valores válidos de página
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Exibe um spinner enquanto carrega os dados
  if (loading || !isAdmin) {
    return <Spinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
      <div className="pb-4">
        <Link href="/admin" className="text-gray-500 hover:text-sanca flex items-center text-sm">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para a página de administração
        </Link>
      </div>

      <div className="mb-2">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <Flag className="w-8 h-8 mr-3 text-sanca" />
          Painel de Denúncias
        </h1>
      </div>

      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => { setActiveTab('open'); setCurrentPage(1); }} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'open' ? 'border-sanca text-sanca' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Abertas
          </button>
          <button onClick={() => { setActiveTab('closed'); setCurrentPage(1); }} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'closed' ? 'border-sanca text-sanca' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Histórico
          </button>
        </nav>
      </div>

      {loadingReports ? (
        <Spinner />
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {reports && reports.length > 0 ? (
          <div className="divide-y divide-gray-200">
          {reports.map((report) => (
            <div key={report.id} className="p-4 flex flex-col md:flex-row items-start gap-4">
            <div className="flex-grow">
              <div className="flex items-center gap-4 mb-2 flex-wrap">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  report.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                  report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {report.status.toUpperCase()}
                </span>
                <div className="text-sm text-gray-500">
                  Data: {new Date(report.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
              
              <p className="font-semibold text-gray-800">
                Motivo: {getReasonText(report.reason)}
              </p>

              {report.details && <p className="text-gray-600 mt-1 text-sm bg-gray-50 p-2 rounded"><strong>Detalhes:</strong> {report.details}</p>}
              
              <div className="mt-3 text-sm space-y-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500"/>
                  <strong>Denunciado por:</strong>
                  <Link href={`/usuario/${report.reporter.slug}`} target="_blank" className="ml-1 text-sanca hover:underline">
                    {report.reporter.display_name}
                  </Link>
                </div>
                <div className="flex items-center">
                  {report.target_type === 'product' ? <Package className="w-4 h-4 mr-2 text-gray-500"/> : <User className="w-4 h-4 mr-2 text-gray-500"/>}
                  <strong>Alvo:</strong>
                  <Link href={`/${report.target_type === 'product' ? 'produto' : 'usuario'}/${report.target_slug}`} target="_blank" className="ml-1 text-sanca hover:underline">
                    {report.target_name || `${report.target_type === 'product' ? 'Anúncio' : 'Usuário'} (${report.target_id})`}
                  </Link>
                </div>
              </div>
            </div>

            {report.status === 'open' && (
              <div className="flex gap-2 self-start md:self-center flex-shrink-0">
                <button 
                  onClick={() => handleUpdateStatus(report.id, 'resolved')}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1"
                >
                  <CheckCircle size={14}/> Resolver
                </button>
                <button 
                  onClick={() => handleUpdateStatus(report.id, 'rejected')}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1"
                >
                  <XCircle size={14}/> Rejeitar
                </button>
              </div>
            )}
            </div>
          ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>Nenhuma denúncia encontrada para esta categoria.</p>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Anterior</button>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">Próxima</button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                    <span className="sr-only">Anterior</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50">
                    <span className="sr-only">Próxima</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
        </div>
      )}
      </main>
    </div>
  );
}