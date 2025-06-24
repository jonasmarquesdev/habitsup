import { User } from "./User";

export interface AuthContextType {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => void;
  isAuthenticatedBoolean: boolean;
  getUsuario: () => Promise<User | undefined>;
}