import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos
export type User = {
  id: string;
  email: string;
  role: "Aluno" | "Professor" | "Admin" | "Financeiro";
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => null,
  logout: () => {},
  register: async () => false,
});

type AuthProviderProps = { children: ReactNode };

export const UserProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const STORAGE_KEY = "@loggedUser";

  // Carrega usuário persistente ao iniciar o app
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch (error) {
        console.log("Erro ao carregar usuário do AsyncStorage:", error);
      }
    };
    loadUser();
  }, []);

  // Login simulado
  const login = async (email: string, password: string): Promise<User | null> => {
    let loggedInUser: User | null = null;

    if (email === "professor@email.com" && password === "123") {
      loggedInUser = { id: "1", email, role: "Professor" };
    } else if (email === "admin@email.com" && password === "123") {
      loggedInUser = { id: "2", email, role: "Admin" };
    } else if (email === "aluno@email.com" && password === "123") {
      loggedInUser = { id: "3", email, role: "Aluno" };
    }

    if (loggedInUser) {
      setUser(loggedInUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loggedInUser));
      return loggedInUser;
    } else {
      setUser(null);
      return null;
    }
  };

  // Registro simulado
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    if (!email.includes("@")) return false;

    console.log(`Registrando usuário: ${name}, ${email}, ${password}`);
    // Opcional: já loga o usuário ao registrar
    const newUser: User = { id: Date.now().toString(), email, role: "Aluno" };
    setUser(newUser);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    return true;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado
export const useUser = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};
