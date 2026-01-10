import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// O tipo User foi mantido como no seu segundo código
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
  viewRole: "ALUNO" | "PROFESSOR" | "ADMIN" | "FINANCEIRO" | null;
  login: (userData: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  setViewRole: (role: "ALUNO" | "PROFESSOR" | "ADMIN" | "FINANCEIRO" | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  viewRole: null,
  login: async () => {},
  logout: async () => {},
  setViewRole: () => {},
});

type AuthProviderProps = { children: ReactNode };

export const UserProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // O nome do state foi alterado para evitar conflito com a função setViewRole
  const [viewRole, setViewRoleState] = useState<"ALUNO" | "PROFESSOR" | "ADMIN" | "FINANCEIRO" | null>(null);

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
      await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
      await AsyncStorage.setItem(STORAGE_KEY_TOKEN, authToken);
      
      setUser(userData);
      setToken(authToken);
      setViewRoleState(null); // Reseta a visão simulada em um novo login
    } catch (error) {
      console.error("Falha ao guardar dados de login:", error);
    }
  };
  
  // LÓGICA NOVA APLICADA AQUI
  const logout = async () => {
    // Se for um ADMIN simulando outra visão, o "Sair" apenas volta ao painel ADMIN
    if (user?.role === 'ADMIN' && viewRole) {
      setViewRoleState(null); // Apenas limpa a simulação, não faz logout real
    } else {
      // Caso contrário, faz o logout real, limpando o AsyncStorage e o estado
      try {
        await AsyncStorage.removeItem(STORAGE_KEY_USER);
        await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
        
        setUser(null);
        setToken(null);
        setViewRoleState(null);
      } catch (error) {
        console.error("Falha ao remover dados de logout:", error);
      }
    }
  };

  // Esta função agora apenas atualiza o estado da simulação
  const setViewRole = (role: "ALUNO" | "PROFESSOR" | "ADMIN" | "FINANCEIRO" | null) => {
    setViewRoleState(role);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, viewRole, login, logout, setViewRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
};