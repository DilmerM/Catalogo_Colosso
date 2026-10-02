import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { modalService } from '../lib/modalService.js';

export default function AdminProductList({ category, onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    setCurrentPage(1);
    const { data, error } = await supabase.from(category).select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const deleteProduct = async (product) => {
    if (!(await modalService.confirm(`¿Estás seguro de que deseas eliminar "${product.name}"?`))) return;
    
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
      await modalService.alert('Error al eliminar: ' + error.message);
    } else {
      setProducts(products.filter(p => p.id !== product.id));
    }
  };

  const toggleProductActive = async (product) => {
    const newActiveState = product.is_active === false ? true : false;
    
    // Update local state instantly for snappy UI
    setProducts(products.map(p => 
      p.id === product.id ? { ...p, is_active: newActiveState } : p
    ));

    // Update in Supabase
    const { error } = await supabase.from(category).update({ is_active: newActiveState }).eq('id', product.id);
    if (error) {
      await modalService.alert('Error al actualizar estado: ' + error.message);
      // Revert local state on error
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, is_active: !newActiveState } : p
      ));
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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesBrand = filterBrand === '' || p.brand === filterBrand;
    return matchesSearch && matchesBrand;
  });

  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="admin-product-list">
      <div className="admin-list-controls">
        <div className="admin-search-box">
          <iconify-icon icon="mdi:magnify"></iconify-icon>
          <input 
            type="text" 
            placeholder="Buscar por nombre o marca..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {uniqueBrands.length > 0 && (
          <div className="admin-filter-box">
            <iconify-icon icon="mdi:filter-variant"></iconify-icon>
            <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
              <option value="">Todas las marcas</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {filteredProducts.length === 0 && !loading ? (
        <div className="admin-empty-state" style={{ marginTop: '20px' }}>
          <p>No se encontraron resultados para tu búsqueda.</p>
        </div>
      ) : (
      <>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {currentProducts.map(product => (
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
              <td>
                <label className="admin-toggle-switch" title={product.is_active !== false ? "Desactivar producto" : "Activar producto"}>
                  <input 
                    type="checkbox" 
                    checked={product.is_active !== false} 
                    onChange={() => toggleProductActive(product)} 
                  />
                  <span className="admin-toggle-slider"></span>
                </label>
              </td>
              <td>
                <div className="admin-actions-group">
                  <button onClick={() => onEdit(product)} className="admin-icon-btn admin-edit-btn" title="Editar">
                    <iconify-icon icon="mdi:pencil-outline" style={{ fontSize: '18px' }}></iconify-icon>
                  </button>
                  <button onClick={() => deleteProduct(product)} className="admin-icon-btn admin-delete-btn" title="Eliminar">
                    <iconify-icon icon="mdi:trash-can-outline" style={{ fontSize: '18px' }}></iconify-icon>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="admin-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            style={{ padding: '8px 12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
          >
            Anterior
          </button>
          <span style={{ display: 'flex', alignItems: 'center', color: '#888' }}>
            Página {currentPage} de {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            style={{ padding: '8px 12px', background: '#2a2a2a', border: '1px solid #444', color: '#fff', borderRadius: '4px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
          >
            Siguiente
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
