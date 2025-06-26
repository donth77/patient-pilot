import { createContext, useContext, useState, ReactNode } from "react";
import { Provider } from "./types";

interface AuthContext {
  selectedProvider: Provider | null;
  setSelectedProvider: (provider: Provider) => void;
  idToken: string | null;
  setIdToken: (token: string | null) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null
  );
  const [idToken, setIdToken] = useState<string | null>(null);

  const clearAuth = () => {
    setIdToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        idToken,
        setIdToken,
        clearAuth,
        selectedProvider,
        setSelectedProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContext => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
