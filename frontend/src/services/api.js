import axios from "axios";

const api = axios.create({baseURL: "http://127.0.0.1:8000",});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const response = await api.post("/auth/login", { username, password });
  localStorage.setItem("userRole", response.data.role);
  return response.data;
};

export const fetchUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export default api;