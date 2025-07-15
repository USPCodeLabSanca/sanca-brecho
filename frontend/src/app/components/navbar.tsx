"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/context/AuthContext";
import { Bell, Search, Menu, User as UserIcon, LogOut, Plus, LogIn } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signOutUser } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { UserType } from "@/lib/types/api";
import api from "@/lib/api/axiosConfig";

export default function Navbar() {
  const router = useRouter();
  const { user, loading: loadingAuth } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [loggedInUserProfile, setLoggedInUserProfile] = useState<UserType | null>(null);
  const [loadingUserProfile, setLoadingUserProfile] = useState(true);

  useEffect(() => {
    const fetchLoggedInUserProfile = async () => {
      if (!user) {
        setLoadingUserProfile(false);
        setLoggedInUserProfile(null);
        return;
      }
      setLoadingUserProfile(true);
      try {
        const idToken = await user.getIdToken();
        const response = await api.get(`/users/me`, {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
        });

        const data = response.data;
        setLoggedInUserProfile(data.user);
      } catch (error) {
        console.error("Failed to fetch logged-in user profile:", error);
        setLoggedInUserProfile(null);
      } finally {
        setLoadingUserProfile(false);
      }
    };

    if (!loadingAuth) {
      fetchLoggedInUserProfile();
    }
  }, [user, loadingAuth]);

  const handleLogout = async () => {
    await signOutUser();

    setMobileOpen(false);
    setProfileOpen(false);
    router.push('/login');
  };

  const handleMouseEnterProfile = () => {
    if (profileTimeoutRef.current) {
      clearTimeout(profileTimeoutRef.current);
    }
    setProfileOpen(true);
  };

  const handleMouseLeaveProfile = () => {
    profileTimeoutRef.current = setTimeout(() => {
      setProfileOpen(false);
    }, 200);
  };

  const isLoading = loadingAuth || loadingUserProfile;

  const userProfileSlug = loggedInUserProfile?.slug;
  const userAvatarSrc = loggedInUserProfile?.photo_url || 'https://sancabrechobucket.s3.us-east-2.amazonaws.com/Portrait_Placeholder.png';

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        {/* Navbar do Header */}
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-sanca z-10">
            Sanca Brechó
          </Link>

          {/* Barra de Busca */}
          <div className="hidden md:flex justify-center flex-1 z-0">
            <div
              className={
                "relative w-full px-4 " +
                "md:max-w-md " +
                "lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2"
              }
            >
              <Search className="absolute left-7 inset-y-0 my-auto w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="O que você está procurando?"
                className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 pl-10 pr-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanca focus-visible:ring-offset-2 md:text-sm"
              />
            </div>
          </div>

          {/* Navegação Desktop */}
          <div className="hidden md:flex items-center space-x-4 z-10">
            {isLoading ? (
              <div className="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9 bg-gray-200 animate-pulse" />
            ) : user && loggedInUserProfile ? (
              <>
                <Link className="text-gray-700 hover:text-sanca" href="/anunciar">
                  Anunciar
                </Link>
                <Link href="/notifications" aria-label="Notificações">
                  <Bell className="text-gray-700 w-5 h-5 hover:text-sanca" />
                </Link>
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnterProfile}
                  onMouseLeave={handleMouseLeaveProfile}
                >
                  <button aria-label="Menu do usuário" onClick={() => router.push(`/usuario/${userProfileSlug}`)} className="cursor-pointer">
                    <span className="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9">
                      <Image
                        alt="foto de perfil"
                        width={36}
                        height={36}
                        className="aspect-square h-full w-full"
                        src={userAvatarSrc}
                      />
                    </span>
                  </button>
                  {profileOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200"
                      onMouseEnter={handleMouseEnterProfile}
                      onMouseLeave={handleMouseLeaveProfile}
                    >
                      <Link
                        href={`/usuario/${userProfileSlug}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-sanca"
                        onClick={() => setProfileOpen(false)}
                      >
                        <UserIcon className="w-4 h-4 mr-2" />
                        Ver Perfil
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-sanca"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link className="flex items-center text-black hover:text-sanca" href="/login">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            )}
          </div>

          {/* Menu de Hamburguer (Mobile) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden z-20"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile: Barra de Busca (Aparece sempre abaixo do header principal no mobile) */}
        <div className="block md:hidden pb-2 pt-2 md:pt-0">
          <div className="relative w-full">
            <Search className="absolute text-slate-400 left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar..."
              className="flex h-10 w-full rounded-md border border-slate-300 px-3 py-2 pl-10 pr-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sanca focus-visible:ring-offset-2 text-sm"
            />
          </div>
        </div>

        {/* Mobile: Dropdown */}
        <div
          className={
            "transition-all duration-300 ease-in-out overflow-hidden md:hidden " +
            (mobileOpen ? "max-h-[500px] opacity-100 pb-3" : "max-h-0 opacity-0")
          }
        >
          <nav className="flex flex-col space-y-1">
            {isLoading ? (
              <div className="relative flex shrink-0 overflow-hidden rounded-full h-9 w-9 bg-gray-200 animate-pulse my-2 mx-auto" />
            ) : user && loggedInUserProfile ? (
              <>
                <Link
                  href="/anunciar"
                  className="flex items-center p-2 text-gray-700 hover:text-sanca rounded-md hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Anunciar
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center p-2 text-gray-700 hover:text-sanca rounded-md hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notificações
                </Link>
                <Link
                  href={`/usuario/${userProfileSlug}`}
                  className="flex items-center p-2 text-gray-700 hover:text-sanca rounded-md hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Perfil
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left p-2 text-gray-700 hover:text-sanca rounded-md hover:bg-gray-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center p-2 text-gray-700 hover:text-sanca rounded-md hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}