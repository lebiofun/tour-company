import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleLogin = async () => {
    try
    {
      const response = await api.post("/auth/login", formData);
      localStorage.setItem("userRole", response.data.role);
      navigate("/dashboard");
    }
    catch (e)
    {
      const errorMessage = e.response?.data?.detail || "Ошибка входа. Проверьте имя пользователя и пароль.";
      setError(errorMessage);
    }
  };
  const handleRegisterClick = () =>
  {
    navigate("/register");
  };
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#dcf7f6",
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Вход
      </Typography>
      {error && (
        <Typography color="error" sx={{ marginBottom: 2 }}>
          {error}
        </Typography>
      )}
      <TextField
        label="Имя пользователя"
        name="username"
        variant="outlined"
        sx={{ marginBottom: 2 }}
        value={formData.username}
        onChange={handleChange}
      />
      <TextField
        label="Пароль"
        name="password"
        type="password"
        variant="outlined"
        sx={{ marginBottom: 2 }}
        value={formData.password}
        onChange={handleChange}
      />
      <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column', alignItems: 'center' }}>
        <Button variant="contained" onClick={handleLogin}>
          Войти
        </Button>
        <Button variant="outlined" onClick={handleRegisterClick}>
          Зарегистрироваться
        </Button>
      </Box>
    </Box>
  );
};

export default Login;