export default function Header({ light, setLight, closeProduct, setShowMachines }) {
  return (
    <header className="nav">
      <a onClick={() => { closeProduct && closeProduct(); setShowMachines && setShowMachines(false); }} className="brand" href="#inicio">IRON<span>/</span>FORM</a>
      <nav>
        <a onClick={() => { closeProduct && closeProduct(); setShowMachines && setShowMachines(false); }} href="#inicio">Inicio</a>
        <a onClick={() => { closeProduct && closeProduct(); setShowMachines && setShowMachines(false); }} href="#equipo-fuerza">Asesoría Gyms</a>
        <a onClick={() => { closeProduct && closeProduct(); setShowMachines && setShowMachines(false); }} href="#tienda">Suplementos</a>
        <a onClick={(e) => { e.preventDefault(); closeProduct && closeProduct(); setShowMachines && setShowMachines(true); window.scrollTo(0,0); }} href="#">Máquinas</a>
      </nav>
      <div className="nav-actions">
      </div>
    </header>
  );
}
