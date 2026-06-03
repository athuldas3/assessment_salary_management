import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1f4e78",
    },
    background: {
      default: "#f4f7fb",
    },
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
});
