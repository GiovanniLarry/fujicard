import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, cartAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    try {
      console.log('AuthContext login attempt with email:', email);
      const response = await authAPI.login(email, password);
      console.log('AuthContext login response:', response.data);

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);

        // Merge guest cart
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
          try {
            await cartAPI.merge(sessionId);
            localStorage.removeItem('sessionId');
          } catch (err) {
            console.log('Cart merge failed:', err);
          }
        }

        return response.data;
      } else {
        throw new Error('Invalid login response');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data) => {
    try {
      console.log('Register attempt with data:', data);
      const response = await authAPI.register(data);
      console.log('Register response:', response.data);

      if (response.data.token && response.data.user) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
        return response.data;
      } else {
        throw new Error('Invalid registration response');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const response = await authAPI.updateProfile(data);
    setUser(response.data.user);
    return response.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      updateProfile,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};
