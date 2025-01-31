import React, { useState } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const [formData, setFormData] = useState({username: "", password: "", confirmPassword: "",});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleRegister = async () => {
    const { username, password, confirmPassword } = formData;
    if (password !== confirmPassword)
    {
      setError("Пароли не совпадают");
      return;
    }
    try
    {
      await api.post("/auth/register", { username, password, role: "user" });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1000);
    } catch (e)
    {
      setError(e.response?.data?.detail || "Ошибка регистрации. Возможно, имя пользователя уже занято.");
    }
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
        Регистрация
      </Typography>
      {success && (
        <Typography color="primary" sx={{ marginBottom: 2 }}>
          Успешная регистрация! Перенаправление...
        </Typography>
      )}
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
      <TextField
        label="Повторите пароль"
        name="confirmPassword"
        type="password"
        variant="outlined"
        sx={{ marginBottom: 2 }}
        value={formData.confirmPassword}
        onChange={handleChange}
      />
      <Button variant="contained" onClick={handleRegister}>
        Зарегистрироваться
      </Button>
      <Button
        variant="text"
        onClick={() => navigate("/")}
        sx={{ marginTop: 2 }}
      >
        Вернуться ко входу
      </Button>
    </Box>
  );
};

export default Register;