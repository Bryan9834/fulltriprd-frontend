import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function Admin() {
    console.log("ADMIN MONTADO");

  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const { data, error } = await supabase
        .from("reservas")
        .select("*");

      console.log("DATA:", data);
      console.log("ERROR:", error);

      if (data) setReservas(data);
    };

    cargar();
  }, []);


  return (
    <div style={{ padding: "20px" }}>
      <h1>Panel de Administración</h1>

      {reservas.length === 0 ? (
        <p>No hay reservas aún</p>
      ) : (
        reservas.map((r) => (
          <div key={r.id} style={{ marginBottom: "10px" }}>
            <strong>{r.nombre}</strong> — {r.email}
          </div>
        ))
      )}
    </div>
  );
}

export default Admin;

