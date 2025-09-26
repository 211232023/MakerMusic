import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos
export type User = {
  id: string;
  email: string;
  name: string; // Adicione o nome
  role: "Aluno" | "Professor" | "Admin" | "Financeiro";
};

type AuthContextType = {
  user: User | null;
  token: string | null; // Adicione o estado para o token
  login: (userData: User, token: string) => void; // A função login agora recebe os dados
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

type AuthProviderProps = { children: ReactNode };

export const UserProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
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
        console.log("Erro ao carregar dados do AsyncStorage:", error);
      }
    };
    loadStoredData();
  }, []);

  const login = async (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    await AsyncStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userData));
    await AsyncStorage.setItem(STORAGE_KEY_TOKEN, authToken);
  };
  
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(STORAGE_KEY_USER);
    await AsyncStorage.removeItem(STORAGE_KEY_TOKEN);
  };

  // A função register não é mais necessária no contexto, pois a tela chama a API diretamente
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
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