import React, { createContext, useState, ReactNode, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Tipos
export type User = {
  id: string;
  email: string;
  name: string;
  role: string; // Garante que a propriedade 'role' está definida aqui
};

type AuthContextType = {
  user: User | null | undefined;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: undefined,
  token: null,
  login: () => {},
  logout: () => {},
});

type AuthProviderProps = { children: ReactNode };

export const UserProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null | undefined>(undefined);
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
        } else {
          setUser(null);
        }
      } catch (error) {
        console.log("Erro ao carregar dados do AsyncStorage:", error);
        setUser(null);
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

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};