import { useState } from "react";
import { supabase } from "../supabaseClient";
import "./Contact.css";

function Contact() {
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    mensaje: ""
  });

  const [estado, setEstado] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.mensaje) {
      setEstado("⚠️ Completa todos los campos");
      return;
    }

    const { error } = await supabase
      .from("contactos")
      .insert([form]);

    if (error) {
      console.error(error);
      setEstado("❌ Error al enviar el mensaje");
    } else {
      setEstado("✅ Mensaje enviado correctamente");
      setForm({ nombre: "", email: "", mensaje: "" });
    }
  };

  return (
    <section className="contact">
      <h2>Contáctanos</h2>
      <p>¿Tienes preguntas o deseas más información?</p>

      {estado && <p className="estado">{estado}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Tu nombre"
          value={form.nombre}
          onChange={handleChange}
        />

        <input
          type="email"
          name="email"
          placeholder="Tu email"
          value={form.email}
          onChange={handleChange}
        />

        <textarea
          name="mensaje"
          placeholder="Tu mensaje"
          value={form.mensaje}
          onChange={handleChange}
        ></textarea>

        <button type="submit">Enviar mensaje</button>
      </form>
    </section>
  );
}

export default Contact;


