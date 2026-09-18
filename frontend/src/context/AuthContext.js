import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem(
      'user',
      JSON.stringify({ _id: data._id, username: data.username, role: data.role })
    );
    setUser({ _id: data._id, username: data.username, role: data.role });
    return data;
  };

  const register = async (username, password, role) => {
    const { data } = await api.post('/auth/register', {
      username,
      password,
      role,
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem(
      'user',
      JSON.stringify({ _id: data._id, username: data.username, role: data.role })
    );
    setUser({ _id: data._id, username: data.username, role: data.role });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);