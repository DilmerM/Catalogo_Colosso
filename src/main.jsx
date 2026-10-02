import { useState, useEffect, useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './responsive-overrides.css';

import { supabase } from './lib/supabase';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import MobileMenu from './components/MobileMenu.jsx';
import Home from './components/views/Home.jsx';
import Shop from './components/views/Shop.jsx';
import ProductDetail from './components/views/ProductDetail.jsx';
import MachinesView from './components/views/MachinesView.jsx';
import GeometricShapes from './components/GeometricShapes.jsx';
import AdminApp from './admin/AdminApp.jsx';
import GlobalModal from './components/GlobalModal.jsx';
import GlobalToast from './components/GlobalToast.jsx';

// ── Smooth Scroll ──────────────────────────────────────────────
function easeInOutQuart(t) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function smoothScrollTo(targetY, duration) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, startY + distance * easeInOutQuart(progress));
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function handleNavClick(e) {
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const hash = anchor.getAttribute('href');
  if (hash === '#' || hash === '#!') return;
  const target = document.querySelector(hash);
  if (!target) return;
  e.preventDefault();
  const targetY = target.getBoundingClientRect().top + window.scrollY - 70;
  const distance = Math.abs(targetY - window.scrollY);
  // Duración proporcional a la distancia: entre 500ms y 1000ms
  const duration = Math.min(Math.max(distance * 0.4, 500), 1000);
  smoothScrollTo(targetY, duration);
}
// ───────────────────────────────────────────────────────────────

function App() {
  const [light, setLight] = useState(false);
  const [filter, setFilter] = useState('TODO');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showMachines, setShowMachines] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [savedScroll, setSavedScroll] = useState(0);
  const [needsScrollRestore, setNeedsScrollRestore] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const openProduct = (p) => {
    if (!selectedProduct) {
      setSavedScroll(window.scrollY);
      // Push state to browser history when opening the first product
      window.history.pushState({ modal: 'product' }, '', '#producto');
    }
    setSelectedProduct(p);
    setActiveImage(0);
    window.scrollTo(0, 0);
  };

  useLayoutEffect(() => {
    if (needsScrollRestore) {
      window.scrollTo(0, savedScroll);
      setNeedsScrollRestore(false);
    }
  }, [needsScrollRestore, savedScroll]);

  // Handle hardware back button
  useEffect(() => {
    const handlePopState = () => {
      if (selectedProduct) {
        setSelectedProduct(null);
        setNeedsScrollRestore(true);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct]);

  const closeProduct = () => {
    if (selectedProduct) {
      // Instead of changing state directly, we trigger a history back,
      // which will fire the popstate listener and close the product.
      window.history.back();
    }
  };
  
  // Smooth scroll global — intercepta todos los hash-links de la página
  useEffect(() => {
    document.addEventListener('click', handleNavClick);
    
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('click', handleNavClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (selectedProduct && selectedProduct.images && selectedProduct.images.length > 1) {
      interval = setInterval(() => {
        setActiveImage(prev => (prev + 1) % selectedProduct.images.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [selectedProduct, activeImage]);

  useEffect(() => {
    async function fetchProducts() {
      const [ropaRes, supsRes] = await Promise.all([
        supabase.from('ropa').select('*').is('is_active', true).order('created_at', { ascending: false }),
        supabase.from('suplementos').select('*').is('is_active', true).order('created_at', { ascending: false })
      ]);

      let combined = [];

      if (!ropaRes.error && ropaRes.data) {
        const mappedRopa = ropaRes.data.map(p => {
          let kind = 'ROPA';
          const name = p.name.toUpperCase();
          if (name.includes('PLAYERA') || name.includes('OVERSIZE')) kind = 'PLAYERAS';
          if (name.includes('TOP')) kind = 'TOPS';
          if (name.includes('SHORT')) kind = 'SHORTS';

          return {
            ...p,
            kind,
            sub: p.gender === 'Mujer' ? 'MUJER' : (p.gender === 'Hombre' ? 'HOMBRE' : 'UNISEX'),
            image: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : '',
            images: p.image_urls || [],
            price: `$${p.price.toFixed(2)} MXN`
          };
        });
        combined = [...combined, ...mappedRopa];
      }

      if (!supsRes.error && supsRes.data) {
        const mappedSups = supsRes.data.map(p => {
          return {
            ...p,
            kind: 'SUPLEMENTOS',
            sub: 'SUPLEMENTO',
            image: p.image_urls && p.image_urls.length > 0 ? p.image_urls[0] : '',
            images: p.image_urls || [],
            price: `$${p.price.toFixed(2)} MXN`
          };
        });
        combined = [...combined, ...mappedSups];
      }

      setProducts(combined);
    }
    fetchProducts();
  }, []);

  const visibleProducts = (filter === 'TODO' || filter === 'ALL_PRODUCTS') ? products : products.filter(p => p.kind === filter);
  
  const isMainView = !selectedProduct && !showMachines;
  const heroProduct = products.find(p => p.name === 'OVERSIZE SNAKE') || products[0];

  return (
    <main className={light ? 'app light' : 'app'} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <Header light={light} setLight={setLight} closeProduct={closeProduct} setShowMachines={setShowMachines} products={products} openProduct={openProduct} />

      <div style={{ display: isMainView ? 'block' : 'none' }}>
        <Home heroProduct={heroProduct} openProduct={openProduct} setFilter={setFilter} />

      <Shop 
        filter={filter} 
        setFilter={setFilter} 
        visibleProducts={visibleProducts} 
        openProduct={openProduct} 
      />

      <section className="cta cta-feature" id="experiencia" style={{position: 'relative'}}>
        <GeometricShapes section="cta" />
        <div className="cta-collage" aria-label="Entrenamiento y equipamiento Iron Form">
          <span className="cta-ghost">IRON</span>
          <figure className="cta-collage-main">
            <img src="/legionarius-store.png" alt="Equipamiento y entrenamiento en Iron Form" loading="lazy"/>
          </figure>
          <figure className="cta-collage-detail">
            <img src="/hero-legionarius.png" alt="Atleta y máquinas de gimnasio" loading="lazy"/>
          </figure>
        </div>
        <div className="cta-feature-copy">
          <p className="eyebrow">IRON/STORE <i></i> LANZAMIENTO 01 / 2025</p>
          <h2>FORJA<br/><em>TU RUTINA.</em></h2>
          <p className="cta-copy">Ropa Legionarius, suplementos y máquinas elegidas para entrenar mejor desde el primer día.</p>
          <div className="cta-benefits">
            <a href="#tienda"><iconify-icon icon="mdi:tshirt-crew-outline" aria-hidden="true"></iconify-icon><span><strong>ROPA LEGIONARIUS</strong><small>Diseñada para rendir</small></span></a>
            <a href="#tienda"><iconify-icon icon="mdi:heart-pulse" aria-hidden="true"></iconify-icon><span><strong>SUPLEMENTOS</strong><small>Nutrición deportiva</small></span></a>
            <a href="#tienda"><iconify-icon icon="mdi:dumbbell" aria-hidden="true"></iconify-icon><span><strong>EQUIPO DE FUERZA</strong><small>Potencia tu espacio</small></span></a>
            <a href="#servicios"><iconify-icon icon="mdi:floor-plan" aria-hidden="true"></iconify-icon><span><strong>ASESORÍA GYM</strong><small>Construimos resultados</small></span></a>
          </div>
          <a className="button red" href="#tienda">VER LA COLECCIÓN <span>↗</span></a>
        </div>
      </section>

      <section id="equipo-fuerza" className="featured-machines" style={{ padding: '80px 5.5%', borderBottom: '1px solid var(--line)' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p className="eyebrow">IRON/STORE <i></i> LÍNEA INDUSTRIAL</p>
          <h2 style={{ font: '800 clamp(48px, 6.9vw, 105px)/0.91 Unbounded, sans-serif', letterSpacing: '-5px', margin: 0 }}>
            EQUIPO DE<br/><em style={{ color: 'var(--red)', fontStyle: 'normal' }}>FUERZA.</em>
          </h2>
        </div>
        <div className="machines-floor" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          
          <article className="machine-row">
            <div className="machine-art-free">
              <div className="floor-shadow"></div>
              <img src="/maquinaParte4.png" alt="MÁQUINA SMITH" loading="lazy" />
            </div>
            <div className="machine-info-free">
              <h3>MÁQUINA SMITH</h3>
              <p>Barra guiada con rodamientos de precisión. Ofrece control absoluto en levantamientos pesados, minimizando el riesgo de lesión.</p>
            </div>
          </article>

          <article className="machine-row">
            <div className="machine-art-free">
              <div className="floor-shadow"></div>
              <img src="/maquinaParte3.png" alt="POLEA CRUZADA" loading="lazy" />
            </div>
            <div className="machine-info-free">
              <h3>POLEA CRUZADA</h3>
              <p>Estación multifuncional con columnas de peso independientes. Ideal para hipertrofia, estabilidad y ejercicios de tensión continua.</p>
            </div>
          </article>

        </div>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '60px' }}>
          <a 
            href="#" 
            className="button red" 
            style={{ fontSize: '14px', padding: '20px 32px', justifyContent: 'center', alignItems: 'center', gap: '14px' }}
            onClick={(e) => { e.preventDefault(); closeProduct && closeProduct(); setShowMachines && setShowMachines(true); window.scrollTo(0, 0); }}
          >
            VER TODAS LAS MÁQUINAS <span style={{ fontSize: '22px', display: 'flex', alignItems: 'center' }}>↗</span>
          </a>
          <a 
            href="https://wa.me/523781498234?text=Hola!%20Me%20interesa%20la%20asesoría%20para%20equipo%20de%20fuerza." 
            target="_blank" 
            rel="noreferrer" 
            className="button outline" 
            style={{ borderColor: 'var(--line)', color: 'var(--ink)', fontSize: '14px', padding: '20px 32px', justifyContent: 'center', alignItems: 'center', gap: '14px' }}
          >
            ASESORÍA POR WHATSAPP <span style={{ fontSize: '26px', display: 'flex', alignItems: 'center' }}><iconify-icon icon="mdi:whatsapp"></iconify-icon></span>
          </a>
        </div>
      </section>

      <section className="map-section" id="ubicacion" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'clamp(40px, 8vw, 80px)', alignItems: 'center', paddingBottom: '80px', position: 'relative' }}>
        <GeometricShapes section="map" />
        <div>
          <p className="eyebrow">VISÍTANOS <i></i> GUADALAJARA, JALISCO</p>
          <h2 style={{ marginBottom: '42px' }}>ENCUENTRA TU<br/><span>PRÓXIMO NIVEL.</span></h2>
          <div style={{ display: 'grid', gap: '32px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <iconify-icon icon="mdi:map-marker-outline" style={{ color: 'var(--red)', fontSize: '32px' }}></iconify-icon>
              <div>
                <strong style={{ display: 'block', fontSize: '18px', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', marginBottom: '8px', color: 'var(--ink)' }}>DIRECCIÓN</strong>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>Av. Providencia 2500<br/>Col. Providencia, 44630<br/>Guadalajara, Jalisco</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <iconify-icon icon="mdi:clock-outline" style={{ color: 'var(--red)', fontSize: '32px' }}></iconify-icon>
              <div>
                <strong style={{ display: 'block', fontSize: '18px', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', marginBottom: '8px', color: 'var(--ink)' }}>HORARIO</strong>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>Lunes a Viernes: 5:30 AM - 11:00 PM<br/>Sábados: 7:00 AM - 9:00 PM</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <iconify-icon icon="mdi:phone-outline" style={{ color: 'var(--red)', fontSize: '32px' }}></iconify-icon>
              <div>
                <strong style={{ display: 'block', fontSize: '18px', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', marginBottom: '8px', color: 'var(--ink)' }}>CONTACTO</strong>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'var(--muted)', fontFamily: 'Inter, sans-serif' }}>+52 378 149 8234<br/>contacto@ironform.com</p>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="map-wrap" style={{ border: '5px solid var(--red)', boxSizing: 'border-box', width: '100%', maxWidth: 'none', margin: 0, height: '500px' }}>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4342.49992037509!2d-103.45457881520792!3d20.77227613134304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428af781134816f%3A0x98e1753ed19c581!2sColosso%20Genesis!5e1!3m2!1ses-419!2shn!4v1790920438833!5m2!1ses-419!2shn" loading="lazy" style={{ width: '100%', height: '100%', border: 'none' }} allowFullScreen="" referrerPolicy="no-referrer-when-downgrade"></iframe>
          </div>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <a href="https://maps.app.goo.gl/rXczpGydwjGM5TG69" target="_blank" rel="noreferrer" className="button red" style={{ padding: '15px 40px', fontSize: '18px', width: '100%', textAlign: 'center' }}>CÓMO LLEGAR EN GOOGLE MAPS <span>↗</span></a>
          </div>
        </div>
      </section>
      </div>

      {selectedProduct && (
        <ProductDetail 
          selectedProduct={selectedProduct}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          closeProduct={closeProduct}
          setFilter={setFilter}
          openProduct={openProduct}
          allProducts={products}
        />
      )}

      {showMachines && <MachinesView />}

      <Footer />
      <MobileMenu closeProduct={closeProduct} setShowMachines={setShowMachines} />
      <div style={{ position: 'fixed', bottom: '18px', right: '18px', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 30 }}>
        {showTopBtn && (
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="scroll-top-float" 
            aria-label="Volver arriba"
          >
            <iconify-icon icon="mdi:chevron-up" style={{ fontSize: '24px' }}></iconify-icon>
          </button>
        )}
        <a className="instagram-float" href="https://www.instagram.com/colosso__genesis/?hl=es" target="_blank" rel="noreferrer" aria-label="Ir a Instagram"><iconify-icon icon="mdi:instagram" style={{ fontSize: '20px' }}></iconify-icon><span>Instagram</span></a>
        <a className="whatsapp-float" href="https://wa.me/523781498234" target="_blank" rel="noreferrer" aria-label="Escribir por WhatsApp"><iconify-icon icon="mdi:whatsapp" style={{ fontSize: '20px' }}></iconify-icon><span>WhatsApp</span></a>
      </div>
    </main>
  );
}

const root = createRoot(document.getElementById('root'));

if (window.location.pathname === '/admin') {
  root.render(
    <>
      <GlobalModal />
      <GlobalToast />
      <AdminApp />
    </>
  );
} else {
  root.render(
    <>
      <GlobalModal />
      <GlobalToast />
      <App />
    </>
  );
}
