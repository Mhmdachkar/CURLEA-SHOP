import { createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import App from "./App.tsx";
import { initializeApp } from "./utils/init";
import theme from "./theme/theme";
import { GlobalStyles } from "./theme/GlobalStyles";
import "./index.css";

// Initialize security, performance, and monitoring
initializeApp();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <App />
  </ThemeProvider>
);
