import { BrowserRouter, Routes, Route } from "react-router-dom";

import Header from "./components/Header";
import Destinos from "./components/Destinos";
import Contact from "./components/Contact";

import Login from "./pages/Login";
import AdminPanel from "./pages/Adminpanel";
import ProtectedRoute from "./components/protectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        {/* Página principal */}
        <Route
          path="/"
          element={
            <>
              <Destinos />
              <Contact />
            </>
          }
        />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Panel Admin protegido */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


