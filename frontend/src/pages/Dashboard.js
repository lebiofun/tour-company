import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,//компонент для текстовых полей ввода
  Button,//компонент для кнопок
  Box,//компонент контейнер для создания layout
  Typography,//компонент для отображения текста с разными стилями
  Select,//компонент выпадающего списка
  MenuItem,//элемент выпадающего списка
  InputLabel,//метка для полей ввода
  FormControl,//контейнер для форм
  Dialog,//модальное окно
  DialogTitle,//заголовок модального окна
  DialogContent,//контент модального окна
  DialogActions,//действия модального окна
}
from "@mui/material";
import api from "../services/api";

const Dashboard = () => {
  //-----------------------Состояния компонента----------------------------
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [filters, setFilters] = useState({country: "", minPrice: "", maxPrice: "",});//фильтры для поиска туров
  const [countries, setCountries] = useState([]);//список стран
  const [userRole] = useState(localStorage.getItem("userRole"));
  const [openBookingDialog, setOpenBookingDialog] = useState(false);//состояние модального окна бронирования
  const [selectedTour, setSelectedTour] = useState(null);//выбранный тур для бронирования
  const [bookingForm, setBookingForm] = useState({first_name: "", last_name: "", email: "", phone: ""});

  //-----------------------Загрузка данных-------------------------
  //загрузка списка стран
  useEffect(() => {
    const fetchCountries = async () => {
      try
      {
        const response = await api.get("/countries");
        setCountries(response.data.items || []);
      }
      catch (error)
      {
        console.error("Ошибка загрузки стран:", error);
      }
    };
    fetchCountries();
  }, []);

  //загрузка списка туров с учетом фильтров
  const fetchTours = useCallback(async () => {
    try
    {
      const response = await api.get("/tours", {
        params: {
          country_id: filters.country || undefined,
          min_price: filters.minPrice || undefined,
          max_price: filters.maxPrice || undefined,
        },
      });
      setTours(response.data.items || []);
    }
    catch (error)
    {
      console.error("Ошибка загрузки туров:", error);
    }
  }, [filters]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  //-----------------------Обработчики событий----------------------------
  //обработка изменения фильтров
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  //форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return "Не указана";
    return new Date(dateString).toLocaleDateString('ru-RU');
  };
  //обработка нжатия на кнопку бронирования
  const handleBookingClick = (tour) => {
    setSelectedTour(tour);
    setOpenBookingDialog(true);
  };
  //закрытие диалога бронирования
  const handleBookingClose = () => {
    setOpenBookingDialog(false);
    setSelectedTour(null);
    setBookingForm({first_name: "", last_name: "", email: "", phone: "",});
  };
  //обработка изменений в форме бронирования
  const handleBookingInputChange = (e) => {
    const { name, value } = e.target;
    setBookingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //отправка формы бронирования
  const handleBookingSubmit = async () => {
    try
    {
      await api.post("/clients", {
        ...bookingForm,
        tour_id: selectedTour.id,
      });
      alert("Заявка успешно отправлена!");
      handleBookingClose();
    }
    catch (error)
    {
      console.error("Ошибка при отправке заявки:", error);
      alert("Произошла ошибка при отправке заявки");
    }
  };


  //-----------------------Рендер компонентов---------------------
  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: "#dcf7f6",
        minHeight: "100vh",
      }}
    >
      {/*-------------кнопка перехода в админ-панель-------------*/}
      {userRole === "admin" && (
        <Box sx={{ position: "absolute", top: 20, right: 20 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/admin")}
          >
            Админ-панель
          </Button>
        </Box>
      )}
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Панель управления турами
      </Typography>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          marginBottom: 4,
        }}
      >
        {/*-------------фильтр по странам-------------*/}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Страна</InputLabel>
          <Select
            value={filters.country}
            name="country"
            onChange={handleFilterChange}
          >
            <MenuItem value="">Все страны</MenuItem>
            {countries.map((country) => (
              <MenuItem key={country.id} value={country.id}>
                {country.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/*-------------фильтры по цене-------------*/}
        <TextField
          label="Мин. цена"
          name="minPrice"
          type="number"
          variant="outlined"
          value={filters.minPrice}
          onChange={handleFilterChange}
        />
        <TextField
          label="Макс. цена"
          name="maxPrice"
          type="number"
          variant="outlined"
          value={filters.maxPrice}
          onChange={handleFilterChange}
        />
        <Button variant="contained" onClick={fetchTours}>
          Применить фильтры
        </Button>
      </Box>
      {/*-------------список туров-------------*/}
      <Box>
        {tours.length === 0 ? (
          <Typography>Туры не найдены.</Typography>
        ) : (
          tours.map((tour) => (
            <Box
              key={tour.id}
              sx={{
                padding: 2,
                marginBottom: 2,
                backgroundColor: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="h6">{tour.name || "Без названия"}</Typography>
              {tour.description && (
                <Typography sx={{ mb: 1 }}>{tour.description}</Typography>
              )}
              <Typography>
                Страна: {countries.find(c => c.id === tour.country_id)?.name || "Не указана"}
              </Typography>
              <Typography>Стоимость: {tour.price.toLocaleString()} ₽</Typography>
              <Typography>Дата начала: {formatDate(tour.start_date)}</Typography>
              <Typography>Дата окончания: {formatDate(tour.end_date)}</Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleBookingClick(tour)}
                >
                  Записаться на тур
                </Button>
              </Box>
            </Box>
          ))
        )}
      </Box>
      {/*-------------диалог бронирования-------------*/}
      <Dialog open={openBookingDialog} onClose={handleBookingClose}>
        <DialogTitle>Запись на тур {selectedTour?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="Имя"
              name="first_name"
              value={bookingForm.first_name}
              onChange={handleBookingInputChange}
              fullWidth
              required
            />
            <TextField
              label="Фамилия"
              name="last_name"
              value={bookingForm.last_name}
              onChange={handleBookingInputChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={bookingForm.email}
              onChange={handleBookingInputChange}
              fullWidth
              required
            />
            <TextField
              label="Телефон"
              name="phone"
              value={bookingForm.phone}
              onChange={handleBookingInputChange}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose}>Отмена</Button>
          <Button onClick={handleBookingSubmit} variant="contained" color="primary">
            Отправить заявку
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;