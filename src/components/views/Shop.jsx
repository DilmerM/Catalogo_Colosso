import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import GeometricShapes from '../GeometricShapes.jsx';
import MobileAutoSlide from '../MobileAutoSlide.jsx';

export default function Shop({ filter, setFilter, visibleProducts, openProduct }) {
  const [visibleCount, setVisibleCount] = useState(30);
  const cardsRef = useRef(null);

  // Reset pagination when category changes
  useEffect(() => {
    if (filter === 'ALL_PRODUCTS') {
      setVisibleCount(1000); // Show all
    } else {
      setVisibleCount(30);
    }
  }, [filter]);

  // CSS-based scroll animation — uses root:null (viewport) so overflow on ancestors doesn't matter
  useEffect(() => {
    const container = cardsRef.current;
    if (!container) return;
    const buttons = container.querySelectorAll('.cat-card');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('cat-card-visible');
        } else {
          entry.target.classList.remove('cat-card-visible');
        }
      });
    }, { root: null, threshold: 0.1 });
    buttons.forEach(btn => observer.observe(btn));
    return () => observer.disconnect();
  }, []);

  const displayedProducts = visibleProducts.slice(0, visibleCount);
  const hasMore = visibleProducts.length > visibleCount;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.section 
      className="shop section" 
      id="tienda"
      style={{ position: 'relative' }}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <GeometricShapes section="shop" />
      <div className="shop-head">
        <motion.div variants={fadeInUp}>
          <p className="eyebrow">IRON/STORE <i></i> COMPRA POR CATEGORÍA</p>
          <h2>TODO PARA<br/><em>ENTRENAR.</em></h2>
        </motion.div>
        <motion.div className="filters" variants={fadeInUp}>
          {['TODO','PLAYERAS','TOPS','SHORTS','ROPA','SUPLEMENTOS'].map(x => (
            <button key={x} className={filter===x ? 'active' : ''} onClick={() => setFilter(x)}>{x}</button>
          ))}
        </motion.div>
      </div>
      
      <div className="category-cards" ref={cardsRef}>
        <button className="cat-card cat-card-left" onClick={() => setFilter('PLAYERAS')}><span>01</span><strong>PLAYERAS</strong><small>Oversize · Sudaderas</small></button>
        <button className="cat-card cat-card-right" onClick={() => setFilter('TOPS')}><span>02</span><strong>TOPS</strong><small>Tops deportivos · Crop tops</small></button>
        <button className="cat-card cat-card-left" onClick={() => setFilter('SHORTS')}><span>03</span><strong>SHORTS</strong><small>Shorts · Entrenamiento</small></button>
        <button className="cat-card cat-card-right" onClick={() => setFilter('SUPLEMENTOS')}><span>04</span><strong>SUPLEMENTOS</strong><small>Proteínas · Pre-entrenos</small></button>
        <button className="cat-card cat-card-left" onClick={() => setFilter('ALL_PRODUCTS')}><span>05</span><strong>TODOS LOS PRODUCTOS</strong><small>Catálogo completo</small></button>
        <button className="cat-card cat-card-right" onClick={() => setFilter('ROPA')}><span>06</span><strong>PANTALONES</strong><small>Pants · Ropa deportiva</small></button>
      </div>
      
      <motion.div 
        key={filter}
        className="product-grid" 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {displayedProducts.map(p => (
          <motion.article 
            variants={fadeInUp}
            className="product" 
            key={p.name} 
            onClick={() => openProduct(p)} 
            style={{ cursor: "pointer" }}
          >
            <div className="product-art multi-hover-art" style={{ padding: 0, overflow: 'hidden' }}>
              {p.images && p.images.length >= 3 ? (
                <>
                  <img src={p.images[0]} className="h-img h-img-1" alt={p.name} />
                  <img src={p.images[1]} className="h-img h-img-2" alt={p.name} />
                  <img src={p.images[2]} className="h-img h-img-3" alt={p.name} />
                  <div className="h-trigger h-trig-1"></div>
                  <div className="h-trigger h-trig-2"></div>
                  <div className="h-trigger h-trig-3"></div>
                </>
              ) : p.images && p.images.length === 2 ? (
                <>
                  <img src={p.images[0]} className="h-img hover-flip-1" alt={p.name} />
                  <img src={p.images[1]} className="h-img hover-flip-2" alt={p.name} />
                </>
              ) : (
                <img src={p.images ? p.images[0] : p.image} className="h-img h-img-1" alt={p.name} />
              )}
              <MobileAutoSlide images={p.images} name={p.name} />
            </div>
            <div className="product-info">
              <div>
                <h3>{p.name}</h3>
                <p>{p.brand} · {p.sub}</p>
              </div>
              <strong>{p.price}</strong>
            </div>
            <button type="button">VER DETALLES <span>↗</span></button>
          </motion.article>
        ))}
      </motion.div>

      {hasMore && (
        <motion.div 
          variants={fadeInUp} 
          style={{ display: 'flex', justifyContent: 'center', marginTop: '45px' }}
        >
          <button 
            className="button outline" 
            onClick={() => setVisibleCount(prev => prev + 6)}
          >
            MOSTRAR MÁS PRODUCTOS
          </button>
        </motion.div>
      )}
    </motion.section>
  );
}
