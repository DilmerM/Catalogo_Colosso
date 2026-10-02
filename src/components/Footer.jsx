export default function Footer() {
  return (
    <footer className="footer-new">
      <div className="footer-about">
        <a className="brand" href="#inicio">IRON<span>/</span>FORM</a>
        <p>Centro de alto rendimiento físico, planes mensuales y soluciones para entrenar, construir y superarte cada día.</p>
        <p className="accent">✦ GARANTÍA OFICIAL &nbsp; • &nbsp; CALIDAD QUE RINDE</p>
      </div>
      <div>
        <h3>NAVEGACIÓN</h3>
        <ul>
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#planes">Planes mensuales</a></li>
          <li><a href="#servicios">Asesoría Gyms</a></li>
          <li><a href="#tienda">Tienda Legionarius</a></li>
          <li><a href="#ubicacion">Contacto y ubicación</a></li>
        </ul>
      </div>
      <div>
        <h3>SERVICIOS GYM</h3>
        <ul>
          <li>Musculación y peso libre</li>
          <li>Zona funcional</li>
          <li>Diseño de gimnasios</li>
          <li>Asesoría deportiva</li>
          <li>Nutrición física</li>
        </ul>
      </div>
      <div>
        <h3>ACCESO AL CLUB</h3>
        <p><strong>Lunes a viernes:</strong><br/>05:30 AM – 11:00 PM</p>
        <p><strong>Sábados:</strong><br/>07:00 AM – 09:00 PM</p>
        <p className="accent">Acceso 24 horas<br/>para plan Elite</p>
      </div>
      <div className="footer-bottom">
        <p>© 2025 IRON/FORM. TODOS LOS DERECHOS RESERVADOS.</p>
        <a href="#inicio">VOLVER ARRIBA ↑</a>
      </div>
    </footer>
  );
}
