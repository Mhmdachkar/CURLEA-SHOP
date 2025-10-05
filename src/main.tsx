import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { initializeApp } from "./utils/init";
import "./index.css";

// Initialize security, performance, and monitoring
initializeApp();

createRoot(document.getElementById("root")!).render(<App />);
