import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#009688",
    },
    secondary: {
      main: "#00796b",
    },
    background: {
      default: "#dcf7f6",
    },
    error: {
      main: "#d32f2f",
    },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

export default theme;
