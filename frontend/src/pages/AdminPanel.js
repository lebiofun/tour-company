import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from "@mui/material";
import api from "../services/api";

const AdminPanel = () => {
  const [tours, setTours] = useState([]);
  const [countries, setCountries] = useState([]);
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState({name: "", country_id: "", price: "", start_date: "", end_date: "",});
  const [clientFormData, setClientFormData] = useState({first_name: "", last_name: "", email: "", phone: "",});
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);
  const fetchData = async () => {
    try
    {
      const [toursResponse, countriesResponse, clientsResponse] = await Promise.all([
        api.get("/tours"),
        api.get("/countries"),
        api.get("/clients"),
      ]);
      setTours(toursResponse.data.items || []);
      setCountries(countriesResponse.data.items || []);
      setClients(clientsResponse.data.items || []);
    }
    catch (error)
    {
      console.error("Ошибка загрузки данных:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  //--------------------------Управление турами--------------------------
  const handleOpenDialog = (item = null) =>
  {
    if (item)
    {
      setFormData(item);
    }
    else
    {
      setFormData({
        name: "",
        country_id: "",
        price: "",
        start_date: "",
        end_date: "",
      });
    }
    setCurrentItem(item);
    setOpenDialog(true);
  };
  const handleCloseDialog = () =>
  {
    setOpenDialog(false);
    setCurrentItem(null);
  };

  const handleInputChange = (e) =>
  {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () =>
  {
    try
    {
      if (currentItem)
      {
        await api.put(`/tours/${currentItem.id}`, formData);
      }
      else
      {
        await api.post("/tours", formData);
      }
      fetchData();
      handleCloseDialog();
    }
    catch (error)
    {
      console.error("Ошибка при сохранении:", error);
    }
  };

  const handleDelete = async (id) =>
  {
    if (window.confirm("Вы уверены, что хотите удалить этот тур?"))
    {
      try
      {
        await api.delete(`/tours/${id}`);
        fetchData();
      }
      catch (error)
      {
        console.error("Ошибка при удалении:", error);
      }
    }
  };
  //--------------------------Управление клиентами--------------------------
  const handleOpenClientDialog = (client = null) =>
  {
    if (client)
    {
      setClientFormData(client);
    }
    else
    {
      setClientFormData({first_name: "", last_name: "", email: "", phone: "",});
    }
    setCurrentClient(client);
    setOpenClientDialog(true);
  };

  const handleCloseClientDialog = () =>
  {
    setOpenClientDialog(false);
    setCurrentClient(null);
  };
  const handleClientInputChange = (e) =>
  {
    const { name, value } = e.target;
    setClientFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClientSubmit = async () =>
  {
    try
    {
      if (currentClient)
      {
        await api.put(`/clients/${currentClient.id}`, clientFormData);
      }
      else
      {
        await api.post("/clients", clientFormData);
      }
      fetchData();
      handleCloseClientDialog();
    }
    catch (error)
    {
      console.error("Ошибка при сохранении клиента:", error);
    }
  };

  const handleDeleteClient = async (id) =>
  {
    if (window.confirm("Вы уверены, что хотите удалить этого клиента?"))
    {
      try
      {
        await api.delete(`/clients/${id}`);
        fetchData();
      }
      catch (error)
      {
        console.error("Ошибка при удалении клиента:", error);
      }
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        Админ-панель
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Туры" />
          <Tab label="Клиенты" />
        </Tabs>
      </Box>

      {currentTab === 0 && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
              Добавить тур
            </Button>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Название</TableCell>
                  <TableCell>Страна</TableCell>
                  <TableCell>Цена</TableCell>
                  <TableCell>Дата начала</TableCell>
                  <TableCell>Дата окончания</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tours.map((tour) => (
                  <TableRow key={tour.id}>
                    <TableCell>{tour.name}</TableCell>
                    <TableCell>{countries.find(c => c.id === tour.country_id)?.name}</TableCell>
                    <TableCell>{tour.price}</TableCell>
                    <TableCell>{tour.start_date}</TableCell>
                    <TableCell>{tour.end_date}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleOpenDialog(tour)}>Редактировать</Button>
                      <Button color="error" onClick={() => handleDelete(tour.id)}>
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {currentTab === 1 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Имя</TableCell>
                  <TableCell>Фамилия</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Телефон</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.first_name}</TableCell>
                    <TableCell>{client.last_name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleOpenClientDialog(client)}>
                        Редактировать
                      </Button>
                      <Button color="error" onClick={() => handleDeleteClient(client.id)}>
                        Удалить
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {currentItem ? "Редактировать тур" : "Добавить новый тур"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 400, mt: 2 }}>
            <TextField
              label="Название"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <FormControl>
              <InputLabel>Страна</InputLabel>
              <Select
                name="country_id"
                value={formData.country_id}
                onChange={handleInputChange}
              >
                {countries.map((country) => (
                  <MenuItem key={country.id} value={country.id}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Цена"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
            />
            <TextField
              label="Дата начала"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Дата окончания"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentItem ? "Сохранить" : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openClientDialog} onClose={handleCloseClientDialog}>
        <DialogTitle>
          {currentClient ? "Редактировать клиента" : "Добавить нового клиента"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 400, mt: 2 }}>
            <TextField
              label="Имя"
              name="first_name"
              value={clientFormData.first_name}
              onChange={handleClientInputChange}
            />
            <TextField
              label="Фамилия"
              name="last_name"
              value={clientFormData.last_name}
              onChange={handleClientInputChange}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={clientFormData.email}
              onChange={handleClientInputChange}
            />
            <TextField
              label="Телефон"
              name="phone"
              value={clientFormData.phone}
              onChange={handleClientInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClientDialog}>Отмена</Button>
          <Button onClick={handleClientSubmit} variant="contained">
            {currentClient ? "Сохранить" : "Добавить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;