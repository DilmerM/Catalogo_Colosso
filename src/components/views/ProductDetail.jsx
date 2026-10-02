import { useState } from 'react';
import './ProductDetail.css';
import GeometricShapes from '../GeometricShapes.jsx';
import { modalService } from '../../lib/modalService.js';

export default function ProductDetail({ selectedProduct, activeImage, setActiveImage, closeProduct, setFilter, openProduct, allProducts }) {
  const [selectedSize, setSelectedSize] = useState(null);
  
  if (!selectedProduct) return null;

  return (
    <section className="pd-view">
      <GeometricShapes section="productDetail" />
      {/* ── Breadcrumb ── */}
      <div className="pd-breadcrumb">
        <button onClick={closeProduct} className="pd-back" aria-label="Volver">
          <span>←</span> REGRESAR
        </button>
        <span className="pd-sep">|</span>
        <a href="#inicio" onClick={closeProduct}>INICIO</a>
        <span className="pd-sep">/</span>
        <a href="#tienda" onClick={closeProduct}>TIENDA</a>
        <span className="pd-sep">/</span>
        <a href="#tienda" onClick={(e) => { e.preventDefault(); setFilter(selectedProduct.kind); closeProduct(); }}>{selectedProduct.kind}</a>
        <span className="pd-sep">/</span>
        <span className="pd-current">{selectedProduct.name}</span>
      </div>

      {/* ── Main Grid ── */}
      <div className="pd-grid">
        {/* Gallery */}
        <div className="pd-gallery">
          {selectedProduct.images && selectedProduct.images.length > 1 && (
            <div className="pd-thumbs">
              {selectedProduct.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={activeImage === i ? 'active' : ''}
                  onClick={() => setActiveImage(i)}
                  alt="Thumbnail"
                />
              ))}
            </div>
          )}
          <div className="pd-main-img">
            <img
              src={
                selectedProduct.images && selectedProduct.images.length > 0
                  ? selectedProduct.images[activeImage] || selectedProduct.image
                  : selectedProduct.image
              }
              alt={selectedProduct.name}
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="pd-info">
          <p className="eyebrow">{selectedProduct.brand} <i></i> {selectedProduct.sub}</p>
          <h2>{selectedProduct.name}</h2>
          <strong className="pd-price">{selectedProduct.price}</strong>

          <div className="pd-desc">
            {selectedProduct.description && selectedProduct.description.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>

          {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
            <div className="pd-sizes">
              <span>TALLA:</span>
              <div className="pd-size-pills">
                {selectedProduct.sizes.map(size => (
                  <button 
                    key={size} 
                    className={`pd-size-pill ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button 
            className="pd-cta" 
            onClick={async () => {
              if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) {
                await modalService.alert('Por favor selecciona una talla antes de continuar.');
                return;
              }
              const phone = "523781498234"; // Real phone number
              const imgUrl = selectedProduct.images && selectedProduct.images.length > 0 
                ? selectedProduct.images[activeImage] || selectedProduct.image 
                : selectedProduct.image;
                
              const fullImgUrl = window.location.origin + imgUrl;
              const text = `Hola! Me interesa pedir el siguiente producto:\n\n*${selectedProduct.name}*\nPrecio: ${selectedProduct.price}\n${selectedSize ? `Talla: ${selectedSize}\n` : ''}Enlace de la imagen: ${fullImgUrl}`;
              const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            PEDIR POR WHATSAPP <span style={{fontSize: '20px'}}><iconify-icon icon="mdi:whatsapp"></iconify-icon></span>
          </button>
        </div>
      </div>

      {/* ── Related Products ── */}
      <div className="pd-related">
        <h3>COINCIDENCIAS</h3>
        <div className="pd-related-grid">
          {allProducts
            .filter(p => p.kind === selectedProduct.kind && p.name !== selectedProduct.name)
            .slice(0, 4)
            .map(p => (
              <article className="pd-related-card" key={p.name} onClick={() => openProduct(p)}>
                <div className="pd-related-card-img">
                  <img src={p.image} alt={p.name} />
                </div>
                <div className="pd-related-card-info">
                  <h4>{p.name}</h4>
                  <strong>{p.price}</strong>
                </div>
              </article>
            ))}
        </div>
      </div>
    </section>
  );
}
