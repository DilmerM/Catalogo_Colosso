import GeometricShapes from '../GeometricShapes.jsx';

export default function MachinesView() {
  const machines = [
    { id: 1, name: "PRENSA DE PIERNAS 45°", desc: "Plataforma de alta capacidad para un aislamiento total de los cuádriceps y glúteos. Diseño biomecánico que reduce la tensión lumbar." },
    { id: 2, name: "HACK SQUAT PROFESIONAL", desc: "Soporte ergonómico para espalda y hombros. Permite una sentadilla profunda con máxima seguridad y transferencia directa de fuerza." },
    { id: 3, name: "POLEA CRUZADA (CABLE CROSSOVER)", desc: "Estación multifuncional con columnas de peso independientes. Ideal para hipertrofia, estabilidad y ejercicios de tensión continua." },
    { id: 4, name: "MÁQUINA SMITH", desc: "Barra guiada con rodamientos de precisión. Ofrece control absoluto en levantamientos pesados, minimizando el riesgo de lesión." },
    { id: 5, name: "REMO EN PUNTA (T-BAR)", desc: "Soporte de pecho ajustable para un estímulo concentrado en la espalda media y dorsales, eliminando el balanceo corporal." },
    { id: 6, name: "EXTENSIÓN DE CUÁDRICEPS", desc: "Eje de rotación alineado anatómicamente con la rodilla. Fundamental para esculpir y fortalecer la porción frontal de la pierna." },
    { id: 7, name: "BANCO PLANO PROFESIONAL", desc: "Base sólida e indeformable para press de banca. Tapizado de alta densidad que estabiliza la escápula bajo cargas máximas." },
    { id: 8, name: "PULLDOWN DORSAL", desc: "Polea alta con soporte de piernas. Ángulo de tracción optimizado para el desarrollo del grosor y amplitud de la espalda." },
    { id: 9, name: "ELEVACIÓN DE PANTORRILLAS", desc: "Plataforma texturizada con soporte lumbar. Permite un estiramiento profundo y contracción máxima del tríceps sural." },
    { id: 10, name: "BANCO SCOTT", desc: "Ángulo perfecto de 45 grados para un aislamiento brutal del bíceps braquial, evitando cualquier tipo de trampa biomecánica." },
    { id: 11, name: "HIP THRUST BIOMECÁNICO", desc: "Cinturón de seguridad ancho y plataforma inclinada para empujar desde los talones, maximizando la activación del glúteo mayor." },
    { id: 12, name: "CRUCE DE POLEAS ALTO", desc: "Estructura ancha para realizar aperturas y cruces en ángulo descendente, esculpiendo la porción inferior del pectoral." },
    { id: 13, name: "RACK DE SENTADILLAS", desc: "Estructura de acero estructural de gran calibre con soportes de seguridad ajustables. El pilar fundamental de cualquier gimnasio serio." }
  ];

  return (
    <section className="machines-page gym-environment" style={{position: 'relative'}}>
      <GeometricShapes section="machines" />
      <div className="machines-hero">
        <p className="eyebrow">IRON/STORE <i></i> LÍNEA INDUSTRIAL</p>
        <h2>EL ESPACIO<br/><span>IRON FORM.</span></h2>
        <p className="lead">Explora nuestra maquinaria de élite plantada sobre nuestro suelo de alto impacto. Sin intermediarios, como si estuvieras aquí.</p>
      </div>
      <div className="machines-floor">
        {machines.map((m) => (
          <article className="machine-row" key={m.id}>
            <div className="machine-art-free">
              <div className="floor-shadow"></div>
              <img src={`/maquinaParte${m.id}.png`} alt={m.name} loading="lazy" />
            </div>
            <div className="machine-info-free">
              <h3>{m.name}</h3>
              <p>{m.desc}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="machines-outro" style={{ textAlign: 'center', margin: '80px 0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <h3 style={{ font: '800 clamp(28px, 5vw, 42px)/1 "Unbounded", sans-serif', color: 'var(--red)', letterSpacing: '-1px', margin: 0 }}>Y MUCHO MÁS...</h3>
        <p style={{ font: '400 18px/1.6 "Manrope", sans-serif', color: 'var(--muted)', margin: 0 }}>Asesórate para invertir en tu futuro.</p>
      </div>
    </section>
  );
}
