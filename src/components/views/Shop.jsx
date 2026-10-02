import { motion } from 'framer-motion';
import GeometricShapes from '../GeometricShapes.jsx';

export default function Shop({ filter, setFilter, visibleProducts, openProduct }) {
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
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
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
      
      <motion.div className="category-cards" variants={fadeInUp}>
        <button onClick={() => setFilter('PLAYERAS')}><span>01</span><strong>PLAYERAS</strong><small>Oversize · Sudaderas</small></button>
        <button onClick={() => setFilter('TOPS')}><span>02</span><strong>TOPS</strong><small>Tops deportivos · Crop tops</small></button>
        <button onClick={() => setFilter('SHORTS')}><span>03</span><strong>SHORTS</strong><small>Shorts · Entrenamiento</small></button>
        <button onClick={() => setFilter('SUPLEMENTOS')}><span>04</span><strong>SUPLEMENTOS</strong><small>Proteínas · Pre-entrenos</small></button>
      </motion.div>
      
      <motion.div 
        key={filter}
        className="product-grid" 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {visibleProducts.map(p => (
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
              ) : (
                <img src={p.image} className="h-img h-img-1" alt={p.name} />
              )}
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
    </motion.section>
  );
}
