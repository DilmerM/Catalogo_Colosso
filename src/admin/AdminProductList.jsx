import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminProductList({ category }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(category).select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`)) return;
    
    // 1. Delete image from Cloudflare R2
    if (product.image_urls && product.image_urls.length > 0) {
      try {
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrls: product.image_urls })
        });
      } catch (err) {
        console.error('Error deleting image from R2:', err);
      }
    }

    // 2. Delete from Supabase
    const { error } = await supabase.from(category).delete().eq('id', product.id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      setProducts(products.filter(p => p.id !== product.id));
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#888' }}>Cargando productos...</div>;
  }

  if (products.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>Aún no hay productos en esta categoría.</p>
        <span>Haz clic en "+ Añadir Producto" para empezar.</span>
      </div>
    );
  }

  return (
    <div className="admin-product-list">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>
                {product.image_urls && product.image_urls.length > 0 ? (
                  <img src={product.image_urls[0]} alt={product.name} className="admin-table-img" />
                ) : (
                  <div className="admin-table-noimg">Sin imagen</div>
                )}
              </td>
              <td>
                <strong>{product.name}</strong>
                <br /><small>{product.brand}</small>
              </td>
              <td>${product.price}</td>
              <td>{new Date(product.created_at).toLocaleDateString()}</td>
              <td>
                <button onClick={() => deleteProduct(product)} className="admin-icon-btn admin-delete-btn">
                  <iconify-icon icon="mdi:trash-can-outline" style={{ fontSize: '18px' }}></iconify-icon>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
