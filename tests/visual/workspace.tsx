import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "@/contexts/auth-context";
import Layout from "@/components/layout";
import { AppRoutes } from "@/routes";
import { fixtureUser } from "./fixture-api";
import "@/index.css";

window.fetch = async () => { throw new Error("Внешние запросы в тестовом стенде отключены"); };
createRoot(document.getElementById("root")!).render(
  <AuthContext.Provider value={{ user: fixtureUser, loading: false, error: null, login: async () => {}, logout: async () => {} }}>
    <div className="border-b bg-amber-50 px-4 py-2 text-xs text-amber-900">Тестовые данные. Изменения действуют только до перезагрузки страницы.</div>
    <MemoryRouter><Layout><AppRoutes /></Layout></MemoryRouter>
  </AuthContext.Provider>
);
