
import {
  createContext,
  useContext,
  useState
} from "react";

const AuthContext = createContext();

const API_URL = "http://localhost:5000/api/users";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const savedAuth = localStorage.getItem("mediphyAuth");
      return savedAuth ? JSON.parse(savedAuth) : null;
    } catch {
      localStorage.removeItem("mediphyAuth");
      return null;
    }
  });

  const user = auth?.user || null;
  const token = auth?.token || null;

  // Register a new User
  const register = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed.");
    }

    return data;
  };

  // Login User or Admin
  const login = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed.");
    }

    const authData = {
      user: data.user,
      token: data.token
    };

    setAuth(authData);

    localStorage.setItem(
      "mediphyAuth",
      JSON.stringify(authData)
    );

    return data;
  };

  // Logout User or Admin
  const logout = async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } finally {
      setAuth(null);
      localStorage.removeItem("mediphyAuth");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        register,
        login,
        logout,
        isLoggedIn: Boolean(user && token),
        isAdmin: user?.role === "admin"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
