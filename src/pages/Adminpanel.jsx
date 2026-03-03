import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import "./Adminpanel.css";

// Administradores permitidos
const ADMINS = ["admin@fulltriprd.com", "bryan9834@hotmail.com"];

/* CARD COMPONENT */
function Card({ title, value, color }) {
  return (
    <div className="card" style={{ borderTop: `4px solid ${color}` }}>
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  );
}

function AdminPanel() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [estadoFiltro, setEstadoFiltro] = useState("todos");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("reciente");

  // Verificar usuario
  useEffect(() => {
    const loadData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate("/login");
        return;
      }

      if (!ADMINS.includes(user.email)) {
        alert("No tienes permiso para acceder al panel de administración");
        await supabase.auth.signOut();
        navigate("/login");
        return;
      }

      setEmail(user.email);

      const { data, error } = await supabase
        .from("reservas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando reservas:", error);
      } else {
        setReservas(data || []);
      }

      setLoading(false);
    };

    loadData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const confirmarReserva = async (reserva) => {
    const { error } = await supabase
      .from("reservas")
      .update({ estado: "confirmada" })
      .eq("id", reserva.id);

    if (error) return console.error("Error confirmando:", error);

    setReservas((prev) =>
      prev.map((r) =>
        r.id === reserva.id ? { ...r, estado: "confirmada" } : r
      )
    );
  };

  const cancelarReserva = async (reserva) => {
    if (
      !window.confirm(
        `¿Seguro que deseas cancelar la reserva de ${reserva.nombre}?`
      )
    )
      return;

    const { error } = await supabase
      .from("reservas")
      .update({ estado: "cancelada" })
      .eq("id", reserva.id);

    if (error) return console.error("Error cancelando:", error);

    setReservas((prev) =>
      prev.map((r) =>
        r.id === reserva.id ? { ...r, estado: "cancelada" } : r
      )
    );
  };

  // Métricas
  const total = reservas.length;
  const pendientes = reservas.filter((r) => r.estado === "pendiente").length;
  const confirmadas = reservas.filter((r) => r.estado === "confirmada").length;
  const canceladas = reservas.filter((r) => r.estado === "cancelada").length;

  // Aplicar filtros + orden
  const reservasFiltradas = reservas
    .filter((r) => {
      if (estadoFiltro !== "todos" && r.estado !== estadoFiltro) return false;
      if (fechaFiltro && r.fecha !== fechaFiltro) return false;

      if (busqueda) {
        const texto = busqueda.toLowerCase();
        const nombre = r.nombre?.toLowerCase() || "";
        const email = r.email?.toLowerCase() || "";

        if (!nombre.includes(texto) && !email.includes(texto)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (orden === "reciente") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(a.created_at) - new Date(b.created_at);
      }
    });

  return (
    <div className="admin-wrapper">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>FullTripRD</h2>
        <nav>
          <button className="active">Dashboard</button>
          <button>Reservas</button>
          <button>Ajustes</button>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Panel de Administración</h1>
          <div>
            <p>👤 {email}</p>
            <button className="logout-btn" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </div>
        </header>

        {/* DASHBOARD */}
        <div className="dashboard">
          <Card title="Total" value={total} color="#319fa8" />
          <Card title="Pendientes" value={pendientes} color="#f5b400" />
          <Card title="Confirmadas" value={confirmadas} color="#00796b" />
          <Card title="Canceladas" value={canceladas} color="#d32f2f" />
        </div>

        {/* FILTROS */}
        <div className="filters">
          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="confirmada">Confirmadas</option>
            <option value="cancelada">Canceladas</option>
          </select>

          <input
            type="date"
            value={fechaFiltro}
            onChange={(e) => setFechaFiltro(e.target.value)}
          />

          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <select value={orden} onChange={(e) => setOrden(e.target.value)}>
            <option value="reciente">Más reciente</option>
            <option value="antiguo">Más antiguo</option>
          </select>

          <button
            className="reset-btn"
            onClick={() => {
              setEstadoFiltro("todos");
              setFechaFiltro("");
              setBusqueda("");
              setOrden("reciente");
            }}
          >
            Limpiar filtros
          </button>
        </div>

        {/* TABLA */}
        <div className="table-container">
          {loading && <p>Cargando...</p>}

          {!loading && reservasFiltradas.length === 0 && (
            <p>No hay reservas con esos filtros.</p>
          )}

          {!loading && reservasFiltradas.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Fecha</th>
                  <th>Personas</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nombre}</td>
                    <td>{r.email}</td>
                    <td>{r.telefono || "—"}</td>
                    <td>{r.fecha || "—"}</td>
                    <td>{r.personas}</td>
                    <td className={`estado ${r.estado}`}>{r.estado}</td>
                    <td>
                      {r.estado === "pendiente" ? (
                        <>
                          <button
                            className="confirm-btn"
                            onClick={() => confirmarReserva(r)}
                          >
                            Confirmar
                          </button>
                          <button
                            className="cancel-btn"
                            onClick={() => cancelarReserva(r)}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminPanel;























