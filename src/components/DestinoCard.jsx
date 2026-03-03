import { motion } from "framer-motion";
import "./DestinoCard.css";

function DestinoCard({ destino, reservar }) {
  // 🔒 Aseguramos que cupos sea número
  const cupos = Number(destino.cupos);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.05 }}
    >
      <h3>{destino.nombre}</h3>
      <p>{destino.descripcion}</p>
      <strong>{destino.precio}</strong>

      <p>
        Cupos disponibles:{" "}
        {isNaN(cupos) ? "No definido" : cupos}
      </p>

      <button
        type="button"
        onClick={reservar}
        disabled={cupos <= 0}
      >
        {cupos <= 0 ? "Agotado" : "Reservar"}
      </button>
    </motion.div>
  );
}

export default DestinoCard;






