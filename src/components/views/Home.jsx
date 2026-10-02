import { motion, useScroll, useTransform } from 'framer-motion';
import GeometricShapes from '../GeometricShapes.jsx';

export default function Home({ heroProduct, openProduct, setFilter }) {
  const fadeInUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <>
      <section className="hero hero-store" id="inicio" style={{ position: 'relative' }}>
        <GeometricShapes section="hero" />
        <div className="hero-bg-carousel">
          <div className="hero-bg-slide slide-1"></div>
          <div className="hero-bg-slide slide-2"></div>
          <div className="hero-bg-slide slide-3"></div>
        </div>
        
        <motion.div 
          className="hero-copy"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.p className="eyebrow hero-kicker" variants={fadeInUp}>TU MOMENTO ES AHORA <i></i> ENTRENAMIENTO REAL</motion.p>
          <motion.h1 variants={fadeInUp}>NO ENTRENES<br/>PARA <em>ENCAJAR.</em><br/>ENTRENA PARA<br/><em>DESTACAR.</em></motion.h1>
          <motion.p className="lead" variants={fadeInUp}>No sigas tendencias. Construye una rutina con productos, equipo y servicios que estén a la altura de tu siguiente versión.</motion.p>
          <motion.div className="hero-buttons" variants={fadeInUp}>
            <a className="button red" href="#tienda">EXPLORAR TIENDA <span>↗</span></a>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="hero-showcase"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="hero-showcase-top">
            <span>SELECCIÓN LEGIONARIUS</span>
            <span>01 / 03</span>
          </div>
          <div 
            className="hero-image-wrap multi-hover-art" 
            onClick={() => heroProduct && openProduct(heroProduct)}
            style={{ cursor: heroProduct ? 'pointer' : 'default', position: 'relative' }}
          >
            {heroProduct ? (
              heroProduct.images && heroProduct.images.length >= 3 ? (
                <>
                  <img src={heroProduct.images[0]} className="hero-image h-img h-img-1" alt={heroProduct.name} />
                  <img src={heroProduct.images[1]} className="hero-image h-img h-img-2" alt={heroProduct.name} />
                  <img src={heroProduct.images[2]} className="hero-image h-img h-img-3" alt={heroProduct.name} />
                  <div className="h-trigger h-trig-1"></div>
                  <div className="h-trigger h-trig-2"></div>
                  <div className="h-trigger h-trig-3"></div>
                </>
              ) : (
                <img src={heroProduct.image} className="hero-image h-img h-img-1" alt={heroProduct.name} />
              )
            ) : (
              <div className="hero-image h-img h-img-1" style={{ background: '#222' }}></div>
            )}
            <div className="hero-product-label" style={{ zIndex: 10 }}>
              <small>{heroProduct ? `${heroProduct.brand} · ${heroProduct.sub}` : 'Cargando...'}</small>
              <strong>{heroProduct ? heroProduct.name : '...'}</strong>
              <span>{heroProduct ? heroProduct.price : ''} {heroProduct ? '↗' : ''}</span>
            </div>
            <div className="hero-badge" style={{ zIndex: 10 }}>ENTRENA<br/><b>FUERTE</b></div>
          </div>
          <div className="hero-showcase-bottom">
            <span>01</span>
            <p>ELIGE TU CATEGORÍA<br/><b>ROPA · SUPLEMENTOS · MÁQUINAS</b></p>
            <a href="#tienda">VER TODO ↗</a>
          </div>
        </motion.div>
        <div className="hero-scroll">DESLIZA PARA DESCUBRIR <span>↓</span></div>
      </section>

      <motion.section 
        className="hero-features" 
        aria-label="Categorías y beneficios de Iron Form"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.a variants={fadeInUp} className="hero-feature-card" href="#tienda" onClick={() => setFilter && setFilter('ROPA')}>
          <span className="hero-feature-icon" aria-hidden="true"><iconify-icon icon="mdi:tshirt-crew-outline"></iconify-icon></span>
          <div className="feature-card-bg"><img src="/ropa_category.jpg" alt="Ropa" className="feature-card-img" /></div>
          <strong>ROPA</strong><small>Legionarius</small>
          <b aria-hidden="true"><iconify-icon icon="lucide:arrow-up-right"></iconify-icon></b>
        </motion.a>
        <motion.a variants={fadeInUp} className="hero-feature-card" href="#tienda" onClick={() => setFilter && setFilter('SUPLEMENTOS')}>
          <span className="hero-feature-icon" aria-hidden="true"><iconify-icon icon="mdi:shaker-outline"></iconify-icon></span>
          <div className="feature-card-bg"><img src="/suplementos_category.jpg" alt="Suplementos" className="feature-card-img" /></div>
          <strong>SUPLEMENTOS</strong><small>Nutrición deportiva</small>
          <b aria-hidden="true"><iconify-icon icon="lucide:arrow-up-right"></iconify-icon></b>
        </motion.a>
        <motion.a variants={fadeInUp} className="hero-feature-card" href="#equipo-fuerza">
          <span className="hero-feature-icon" aria-hidden="true"><iconify-icon icon="mdi:dumbbell"></iconify-icon></span>
          <div className="feature-card-bg"><img src="/maquinas_category.jpg" alt="Máquinas" className="feature-card-img" /></div>
          <strong>MÁQUINAS</strong><small>Fuerza y cardio</small>
          <b aria-hidden="true"><iconify-icon icon="lucide:arrow-up-right"></iconify-icon></b>
        </motion.a>
        <motion.a variants={fadeInUp} className="hero-feature-card" href="#equipo-fuerza">
          <span className="hero-feature-icon" aria-hidden="true"><iconify-icon icon="mdi:floor-plan"></iconify-icon></span>
          <div className="feature-card-bg"><img src="/asesoria_category.jpg" alt="Asesoría Gym" className="feature-card-img" /></div>
          <strong>ASESORÍA GYM</strong><small>Diseña tu espacio</small>
          <b aria-hidden="true"><iconify-icon icon="lucide:arrow-up-right"></iconify-icon></b>
        </motion.a>
        <motion.a variants={fadeInUp} className="hero-feature-card" href="#ubicacion">
          <span className="hero-feature-icon" aria-hidden="true"><iconify-icon icon="mdi:truck-fast-outline"></iconify-icon></span>
          <div className="feature-card-bg"><img src="/envios_category.jpg" alt="Envíos" className="feature-card-img" /></div>
          <strong>ENVÍOS</strong><small>A todo México</small>
          <b aria-hidden="true"><iconify-icon icon="lucide:arrow-up-right"></iconify-icon></b>
        </motion.a>
      </motion.section>

      <motion.section 
        className="mobile-photo-strip" 
        aria-label="Tienda de equipamiento fitness"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <div className="mobile-photo-copy">
          <p className="eyebrow">IRON/STORE <i></i> EQUIPAMIENTO FITNESS</p>
          <h2>EQUIPA<br/><em>TU RUTINA.</em></h2>
          <p className="mobile-store-lead">Ropa, accesorios y equipo seleccionado para entrenar mejor desde el primer día.</p>
          <a className="button red mobile-store-button" href="#tienda">VER LA COLECCIÓN <span>↗</span></a>
        </div>
        <div className="mobile-photo-grid" aria-label="Galería de entrenamiento">
          <div className="mobile-photo-track">
            <img src="https://images.unsplash.com/photo-1641337221253-fdc7237f6b61?auto=format&fit=crop&w=900&q=80" alt="Persona entrenando con mancuernas en un gimnasio" loading="lazy"/>
            <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=700&q=80" alt="Sala de entrenamiento con equipo de gimnasio" loading="lazy"/>
            <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=700&q=80" alt="Entrenamiento de fuerza con barra" loading="lazy"/>
            <img src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=700&q=80" alt="Atleta levantando pesas" loading="lazy"/>
            <img src="https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?auto=format&fit=crop&w=700&q=80" alt="Persona entrenando en gimnasio" loading="lazy"/>
            <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=700&q=80" alt="Sesión de entrenamiento funcional" loading="lazy"/>
          </div>
        </div>
        <div className="mobile-store-categories">
          <span>ROPA</span><span>ACCESORIOS</span><span>EQUIPO</span>
        </div>
      </motion.section>
    </>
  );
}
