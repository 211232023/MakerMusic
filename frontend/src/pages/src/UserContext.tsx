import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type User = {
  id: number;
  email: string;
  name: string;
  role: "ALUNO" | "PROFESSOR" | "ADMIN" | "FINANCEIRO";
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (userData: User, token: string) => Promise<void>; // Tornamos a função assíncrona
  logout: () => Promise<void>; // Tornamos a função assíncrona
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

type AuthProviderProps = { children: ReactNode };

export const UserProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const STORAGE_KEY_USER = "@loggedUser";
  const STORAGE_KEY_TOKEN = "@authToken";

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(STORAGE_KEY_USER);
        const storedToken = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (error) {
        console.error("Erro ao carregar dados do AsyncStorage:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStoredData();
  }, []);

  const login = async (userData: User, authToken: string) => {
    try {
      // Primeiro, guarda os dados no AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, authToken);
      // Só depois atualiza o estado da aplicação
      setUser(userData);
      setToken(authToken);
      console.log("Dados de login guardados com sucesso no AsyncStorage!");
    } catch (error) {
      console.error("Falha ao guardar dados de login:", error);
    }
  };
  
  const logout = async () => {
    try {
      // Primeiro, remove os dados do AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEY_USER);
      await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
      // Só depois atualiza o estado
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Falha ao remover dados de logout:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};