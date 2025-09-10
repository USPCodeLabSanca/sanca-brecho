"use client";

import { useEffect, useState } from "react";
import { Mail, Save, ArrowLeft, Trash2, Phone, Send } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { ProfileType } from "@/lib/types/api";
import { getProfileBySlug } from "@/lib/services/profileService";
import Spinner from "@/app/components/spinner";
import { getMe, updateMe, deleteMe } from "@/lib/services/userService";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import notFound from "../not-found";
import { signOutUser } from "@/lib/firebase/auth";
import Image from "next/image";

const EditarUsuario = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { user: currentUserFirebase, loading: loadingAuth } = useAuth();

  const [userProfile, setUserProfile] = useState<ProfileType | undefined>(undefined);
  const [telegram, setTelegram] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  const [isOwnerProfile, setIsOwnerProfile] = useState<boolean | undefined>(undefined);
  const [loadingOwnership, setLoadingOwnership] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  // Busca os dados do perfil acessado
  useEffect(() => {
    const fetchProfile = async () => {
      if (!slug) {
        setLoadingProfile(false);
        setErrorProfile("Slug do usuário não fornecido.");
        return;
      }
      try {
        const data = await getProfileBySlug(slug);
        setUserProfile(data);
        setTelegram(data.telegram || "");
      } catch (error: any) {
        setUserProfile(undefined);
        setErrorProfile(error.message);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [slug]);

  // Verifica se o usuário logado é o dono do perfil
  useEffect(() => {
    // Só roda se o usuário do Firebase já foi carregado
    if (!loadingAuth) {
      if (!currentUserFirebase) {
        setIsOwnerProfile(false);
        setLoadingOwnership(false);
        return;
      }
      const checkOwnership = async () => {
        try {
          const data = await getMe();
          setIsOwnerProfile(data.slug === slug);
        } catch (error: any) {
          console.error("Falha ao verificar propriedade:", error);
          setIsOwnerProfile(false);
        } finally {
          setLoadingOwnership(false);
        }
      };
      checkOwnership();
    }
  }, [slug, currentUserFirebase, loadingAuth]);

  // Redireciona o usuário caso ele não seja o dono do perfil
  useEffect(() => {
    if (isDeleting) {
      return;
    }

    // Roda apenas quando a verificação de propriedade terminar e o resultado for negativo
    if (loadingOwnership === false && isOwnerProfile === false) {
      showErrorToast("Você não tem permissão para editar este perfil.");
      router.push(`/usuario/${slug}`);
    }
  }, [isOwnerProfile, loadingOwnership, router, slug, isDeleting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateMe({ telegram });
      showSuccessToast("Perfil atualizado com sucesso!");
      router.push(`/usuario/${slug}`);
    } catch (error) {
      showErrorToast("Erro ao atualizar o perfil.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação é irreversível."
      )
    ) {
      setIsDeleting(true);
      setIsSubmitting(true);
      try {
        await deleteMe();
        await signOutUser();
        showSuccessToast("Conta excluída com sucesso.");
        router.push("/login");
      } catch (error) {
        showErrorToast("Erro ao excluir a conta.");
        console.error(error);
        setIsSubmitting(false);
        setIsDeleting(false);
      }
    }
  };

  // Enquanto carrega os dados ou verifica a permissão, exibe o Spinner
  if (loadingProfile || loadingAuth || loadingOwnership) {
    return <Spinner />;
  }

  // Se o usuário não for o dono, exibe o Spinner enquanto o redirecionamento acontece
  if (!isOwnerProfile) {
    return <Spinner />;
  }

  // Se o perfil não for encontrado após o carregamento
  if (!userProfile) {
    return notFound();
  }

  if (errorProfile) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-red-500">
        <p>Erro ao carregar o perfil: {errorProfile}</p>
      </div>
    );
  }

  const userAvatar =
    userProfile?.photo_url ||
    "/user_placeholder.png";

  return (
    <div className="bg-sanca/10 min-h-screen">
      <div className="max-w-2xl mx-auto py-4 px-4">
        <div>
          <Link
            href={`/usuario/${slug}`}
            className="text-gray-500 hover:text-sanca flex items-center text-sm mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para o perfil
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 py-3">
          Editar Perfil
        </h1>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 relative">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <Image
                    src={userAvatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                    width={96}
                    height={96}
                  />
                </div>
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
                  value={userProfile?.email}
                  id="email"
                  name="email"
                  placeholder="seu@email.com"
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                O email não pode ser alterado.
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="telefone"
                className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium"
              >
                Telefone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={userProfile?.whatsapp || ""}
                  id="telefone"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                O telefone não pode ser alterado. {/* Podemos implementar pra alterar o telefone, mas deve refazer a verificação captcha */}
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="telegram"
                className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block text-sm font-medium"
              >
                Telegram
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Send className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  id="telegram"
                  name="telegram"
                  placeholder="usuario_telegram"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm pl-10"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href={`/usuario/${slug}`} className="w-1/2">
                <button
                  type="button"
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-sanca disabled:bg-gray-400 text-white rounded-md hover:bg-sanca/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </form>
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-red-600">
              Zona de Perigo
            </h2>
            <p className="text-sm text-gray-600 mt-2">
              A exclusão da sua conta é uma ação permanente e irreversível.
              Todos os seus dados, anúncios e informações de perfil serão
              removidos.
            </p>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir minha conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarUsuario;