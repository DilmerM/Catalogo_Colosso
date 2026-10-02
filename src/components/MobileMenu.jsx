import { useState } from 'react';

export default function MobileMenu({ closeProduct, setShowMachines }) {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);

  const toggle = () => {
    if (open) {
      setAnimating(true);
      setTimeout(() => { setOpen(false); setAnimating(false); }, 300);
    } else {
      setOpen(true);
    }
  };

  const handleNav = (e) => {
    // Close ProductDetail & Machines views, then navigate
    closeProduct && closeProduct();
    setShowMachines && setShowMachines(false);
    toggle();
  };

  const handleMachines = (e) => {
    e.preventDefault();
    closeProduct && closeProduct();
    setShowMachines && setShowMachines(true);
    toggle();
    window.scrollTo(0, 0);
  };

  const navClass = open && !animating ? 'mnav mnav-enter' : animating ? 'mnav mnav-exit' : 'mnav';

  return (
    <div className={`mobile-menu${open ? ' is-open' : ''}`}>
      <button
        className="mobile-menu-btn"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú móvil'}
        onClick={toggle}
      >
        <span className="hbg-line"></span>
        <span className="hbg-line"></span>
        <span className="hbg-line"></span>
      </button>
      {(open || animating) && (
        <nav className={navClass}>
          <a href="#inicio" onClick={handleNav}>Inicio</a>
          <a href="#equipo-fuerza" onClick={handleNav}>Asesoría Gyms</a>
          <a href="#tienda" onClick={handleNav}>Suplementos</a>
          <a href="#" onClick={handleMachines}>Máquinas</a>
          <a href="#ubicacion" onClick={handleNav}>Ubicación</a>
          <a href="https://wa.me/523781498234" target="_blank" rel="noreferrer">WhatsApp</a>
        </nav>
      )}
    </div>
  );
}
