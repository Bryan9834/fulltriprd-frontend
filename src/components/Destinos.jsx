import { useEffect, useState } from "react";
import DestinoCard from "./DestinoCard";
import ReservaModal from "./ReservaModal";
import "./Destinos.css";
import { supabase } from "../supabaseClient";

function Destinos() {
  const [destinos, setDestinos] = useState([]);
  const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);

  useEffect(() => {
    const obtenerDestinos = async () => {
      const { data, error } = await supabase
        .from("destinos")
        .select("*");

      if (error) {
        console.error("Error cargando destinos:", error);
      } else {
        setDestinos(data || []);
      }
    };

    obtenerDestinos();
  }, []);

  return (
    <section id="destinos" className="destinos">
      <h2>Destinos disponibles</h2>
      <p>Selecciona tu próxima aventura con FullTripRD</p>

      <div className="destinos-grid">
        {destinos.map((destino) => (
          <DestinoCard
            key={destino.id}
            destino={destino}
            reservar={() => setDestinoSeleccionado(destino)}
          />
        ))}
      </div>

      {/* ✅ DEFENSA TOTAL */}
      {destinoSeleccionado && destinoSeleccionado.nombre && (
        <ReservaModal
          destino={destinoSeleccionado}
          onClose={() => setDestinoSeleccionado(null)}
          onReservaExitosa={(personas) => {
            setDestinos((prev) =>
              prev.map((d) =>
                d.id === destinoSeleccionado.id
                  ? { ...d, cupos: d.cupos - personas }
                  : d
              )
            );
          }}
        />
      )}
    </section>
  );
}

export default Destinos;















