import { User } from "./User";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAuthenticatedBoolean: boolean;
  getUsuario: () => Promise<User | undefined>;
}