import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import "./ReservaModal.css";
import { motion, AnimatePresence } from "framer-motion";

function ReservaModal({ destino, onClose, onReservaExitosa }) {
  if (!destino) return null;

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [personas, setPersonas] = useState(1);
  const [fecha, setFecha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [reservaExitosa, setReservaExitosa] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const cerrarConEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", cerrarConEsc);

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", cerrarConEsc);
    };
  }, [onClose]);

  const reservar = async () => {
    if (loading) return;

    setErrorMsg("");
    setReservaExitosa(false);

    const nombreLimpio = nombre.trim();
    const emailLimpio = email.trim().toLowerCase();
    const telefonoLimpio = telefono.trim();
    const cuposSolicitados = Number(personas);

    // 🔎 Validaciones
    if (!nombreLimpio) return setErrorMsg("Debes ingresar tu nombre");
    if (!emailLimpio.includes("@") || !emailLimpio.includes("."))
      return setErrorMsg("Email inválido");
    if (!telefonoLimpio) return setErrorMsg("Debes ingresar un teléfono");
    if (!fecha) return setErrorMsg("Debes seleccionar una fecha");
    if (cuposSolicitados < 1)
      return setErrorMsg("Cantidad de personas inválida");
    if (cuposSolicitados > destino.cupos)
      return setErrorMsg(`No puedes reservar más de ${destino.cupos} personas`);

    setLoading(true);

    try {
      // 1️⃣ Consultar reservas existentes para ese destino y fecha
      const { data: reservasExistentes, error: errorConsulta } = await supabase
        .from("reservas")
        .select("personas")
        .eq("destino_id", destino.id)
        .eq("fecha", fecha);

      if (errorConsulta) {
        console.error(errorConsulta);
        setErrorMsg("No se pudo verificar la disponibilidad.");
        setLoading(false);
        return;
      }

      const totalReservado = reservasExistentes.reduce(
        (acc, r) => acc + r.personas,
        0
      );

      if (totalReservado + cuposSolicitados > destino.cupos) {
        setErrorMsg("No hay suficientes cupos disponibles para esta fecha.");
        setLoading(false);
        return;
      }

      // 2️⃣ Insertar reserva (UN SOLO INSERT)
      const { error: insertError } = await supabase
        .from("reservas")
        .insert({
          destino_id: destino.id,
          nombre: nombreLimpio,
          email: emailLimpio,
          telefono: telefonoLimpio,
          personas: cuposSolicitados,
          fecha,
          estado: "pendiente",
        });

      if (insertError) {
        if (insertError.code === "23505") {
          setErrorMsg("Ya tienes una reserva para esa fecha.");
        } else {
          console.error(insertError);
          setErrorMsg("Ocurrió un error creando la reserva.");
        }
        setLoading(false);
        return;
      }

      // 3️⃣ Reserva exitosa
      setReservaExitosa(true);
      onReservaExitosa?.(cuposSolicitados);

      // 4️⃣ Mensaje WhatsApp automático
      const mensaje = [
        "Hola 👋, acabo de hacer una reserva en FullTripRD 🌴",
        "",
        `📍 Destino: ${destino.nombre}`,
        `📅 Fecha: ${fecha}`,
        `👥 Personas: ${cuposSolicitados}`,
        "",
        "💳 Información de pago:",
        destino.cuenta_pago || "Te enviaremos la información de pago en breve",
        "",
        "👉 Únete al grupo aquí:",
        destino.whatsapp_grupo ||
          "Te enviaremos el enlace del grupo en breve",
      ].join("\n");

      window.open(
        `https://wa.me/18099906790?text=${encodeURIComponent(mensaje)}`,
        "_blank"
      );
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocurrió un error, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="modal"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 40, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h3>Reservar {destino.nombre}</h3>

          {errorMsg && <p className="error">{errorMsg}</p>}
          {reservaExitosa && (
            <p className="success">
              ✅ Reserva realizada con éxito. Revisa WhatsApp.
            </p>
          )}

          <input
            type="text"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={loading}
          />

          <input
            type="email"
            placeholder="Tu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />

          <input
            type="text"
            placeholder="Tu número de WhatsApp"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            disabled={loading}
          />

          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            disabled={loading}
          />

          <input
            type="number"
            min="1"
            max={destino.cupos}
            value={personas}
            onChange={(e) => setPersonas(Number(e.target.value))}
            disabled={loading}
          />

          <button onClick={reservar} disabled={loading}>
            {loading ? "Reservando..." : "Confirmar reserva"}
          </button>

          <button className="cancelar" onClick={onClose} disabled={loading}>
            Cancelar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ReservaModal;
































