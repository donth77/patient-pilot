import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { PrimeReactProvider } from "primereact/api";
import { AuthProvider } from "./AuthContext.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <PrimeReactProvider>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </PrimeReactProvider>
);
