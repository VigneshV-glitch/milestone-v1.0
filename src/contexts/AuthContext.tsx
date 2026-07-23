import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: any;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string, name: string) => Promise<any>;
  signOut: () => Promise<void>;
  isModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    authService.getCurrentUser().then((usr) => {
      setUser(usr);
      setLoading(false);
    });

    const subscription = authService.onAuthStateChange((usr) => {
      setUser(usr);
      setLoading(false);
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    const res = await authService.signIn(email, pass);
    setUser(res.user);
    setIsModalOpen(false);
    return res;
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const res = await authService.signUp(email, pass, name);
    setUser(res.user);
    setIsModalOpen(false);
    return res;
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        isModalOpen,
        openAuthModal: () => setIsModalOpen(true),
        closeAuthModal: () => setIsModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
