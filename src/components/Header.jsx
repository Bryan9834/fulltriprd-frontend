import "./header.css";

function Header() {
  const irADestinosv = () => {
    const seccion = document.getElementById("destinos");
    if (seccion) {
      seccion.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="header">
      <h1>FullTripRD</h1>
      <p>Plataforma para reservas turísticas en República Dominicana</p>
      <button onClick={irADestinosv}>Reservar ahora</button>
    </header>
  );
}

export default Header;



