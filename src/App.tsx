import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout";
import { Dashboard, Developers, Tickets, Bugs, Reports, Settings } from "@/pages";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="developers" element={<Developers />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="bugs" element={<Bugs />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
