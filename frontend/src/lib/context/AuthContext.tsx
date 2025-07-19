"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { login } from '@/services/authService';
import { getMe } from '@/services/userService';
import { UserType } from '@/types/api';

interface ProfileContextType {
  firebaseUser: FirebaseUser | null;
  user: UserType | null;
  authLoading: boolean;
  userLoading: boolean;
  firstName: string | null;
  isAuthenticated: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  clearProfile: () => void;
  logout: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [userLoading, setUserLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState<string | null>(null);

  const fetchUserData = async (firebaseUser: FirebaseUser) => {
    try {
      setUserLoading(true);
      setError(null);
      
      const idToken = await firebaseUser.getIdToken();
      
      await login(idToken);
      
      const userData = await getMe();
      setUser(userData);
      
      const apiFirstName = userData.name?.split(' ')[0];
      const firebaseFirstName = firebaseUser.displayName?.split(' ')[0];
      setFirstName(apiFirstName || firebaseFirstName || null);
      
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      setError('Erro ao carregar dados do usuário');
      setUser(null);
      
      if (firebaseUser.displayName) {
        setFirstName(firebaseUser.displayName.split(' ')[0]);
      }
    } finally {
      setUserLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!firebaseUser) return;
    
    try {
      setUserLoading(true);
      setError(null);
      
      const userData = await getMe();
      setUser(userData);
      
      const apiFirstName = userData.name?.split(' ')[0];
      const firebaseFirstName = firebaseUser.displayName?.split(' ')[0];
      setFirstName(apiFirstName || firebaseFirstName || null);
      
    } catch (err) {
      console.error('Erro ao atualizar dados do usuário:', err);
      setError('Erro ao atualizar dados do usuário');
    } finally {
      setUserLoading(false);
    }
  };

  const clearProfile = () => {
    setUser(null);
    setFirstName(null);
    setError(null);
  };

  const logout = async () => {
    try {
      await auth.signOut();
      clearProfile();
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      setError('Erro ao fazer logout');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setFirebaseUser(currentUser);
      setAuthLoading(false);
      
      if (currentUser) {
        fetchUserData(currentUser);
      } else {
        clearProfile();
      }
    });

    return () => unsubscribe();
  }, []);

  const value: ProfileContextType = {
    firebaseUser,
    user,
    authLoading,
    userLoading,
    firstName,
    isAuthenticated: !!firebaseUser,
    error,
    refreshUser,
    clearProfile,
    logout,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile deve ser usado dentro de um ProfileProvider');
  }
  return context;
};