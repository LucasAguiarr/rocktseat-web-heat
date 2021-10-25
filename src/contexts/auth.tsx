import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

interface IAuthProvider {
  children: ReactNode;
}

interface IUser {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

interface IAuthContextData {
  user: IUser | null;
  signInUrl: string;
  signOut: () => void;
}

interface IAuthResponse {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  };
}

export const AuthContext = createContext({} as IAuthContextData);

export const AuthProvider = ({ children }: IAuthProvider) => {
  const [user, setUser] = useState<IUser | null>(null);
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=4e89b1629cf6fc0fef98`;

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes("?code=");

    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split("?code=");

      window.history.pushState({}, "", urlWithoutCode);

      signIn(githubCode);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("@dowhile:token");

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`;
      api.get<IUser>("/profile").then((res) => setUser(res.data));
    }
  }, []);

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("@dowhile:token");
  };

  const signIn = async (code: string) => {
    const res = await api.post<IAuthResponse>("/authenticate", {
      code,
    });

    const { token, user } = res.data;

    localStorage.setItem("@dowhile:token", token);

    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user);
  };

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
