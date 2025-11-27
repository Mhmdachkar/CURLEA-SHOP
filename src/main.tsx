import { createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import App from "./App.tsx";
import { initializeApp } from "./utils/init";
import { initializeCampaignTracking } from "./utils/campaignTracking";
import theme from "./theme/theme";
import { GlobalStyles } from "./theme/GlobalStyles";
import "./index.css";

// Initialize security, performance, and monitoring
initializeApp();

// Initialize campaign tracking
initializeCampaignTracking();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <GlobalStyles />
    <App />
  </ThemeProvider>
);
