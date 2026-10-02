import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminProductForm({ category, productToEdit, onSaved, onCancel }) {
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '', slug: '', brand: '', description: '', price: '', discount_price: '',
    gender: 'Unisex', sizes: '', colors: '', material: '', // Ropa
    weight: '', flavor: '', type: '', // Suplementos/Máquinas
    dimensions: '', weight_capacity: '', features: '' // Máquinas
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        slug: productToEdit.slug || '',
        brand: productToEdit.brand || '',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        discount_price: productToEdit.discount_price || '',
        gender: productToEdit.gender || 'Unisex',
        sizes: Array.isArray(productToEdit.sizes) ? productToEdit.sizes.join(', ') : '',
        colors: Array.isArray(productToEdit.colors) ? productToEdit.colors.join(', ') : '',
        material: productToEdit.material || '',
        weight: productToEdit.weight || '',
        flavor: productToEdit.flavor || '',
        type: productToEdit.type || '',
        dimensions: productToEdit.dimensions || '',
        weight_capacity: productToEdit.weight_capacity || '',
        features: Array.isArray(productToEdit.features) ? productToEdit.features.join(', ') : ''
      });
      setExistingImages(productToEdit.image_urls || []);
    }
  }, [productToEdit]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [formData.description]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    if (value.length <= 500) {
      setFormData({ ...formData, description: value });
      // Auto-grow logic
      e.target.style.height = 'auto';
      e.target.style.height = `${e.target.scrollHeight}px`;
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeExistingImage = async (urlToRemove) => {
    if (!window.confirm('¿Eliminar esta imagen de forma permanente?')) return;
    
    // Optimistic UI update
    const updatedImages = existingImages.filter(url => url !== urlToRemove);
    setExistingImages(updatedImages);

    // Delete from Supabase instantly
    if (productToEdit) {
      await supabase.from(category).update({ image_urls: updatedImages }).eq('id', productToEdit.id);
    }

    // Delete from R2
    try {
      await fetch('/api/delete-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrls: [urlToRemove] })
      });
    } catch (err) {
      console.error('Error deleting image from R2:', err);
    }
  };

  const uploadImageToR2 = async (file) => {
    // 1. Convert file to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // 2. Send to server for WebP conversion and upload
    const res = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: file.name, imageBase64: base64 })
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error uploading image');
    }
    const { publicUrl } = await res.json();

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImageToR2(imageFile);
      }

      // Combine existing images and new image (if any)
      const finalImageUrls = [...existingImages];
      if (imageUrl) {
        finalImageUrls.push(imageUrl);
      }

      // Prepare payload based on category
      const payload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
        brand: formData.brand,
        description: formData.description,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        image_urls: finalImageUrls
      };

      if (category === 'ropa') {
        payload.gender = formData.gender;
        payload.sizes = formData.sizes.split(',').map(s => s.trim());
        payload.colors = formData.colors.split(',').map(c => c.trim());
        payload.material = formData.material;
      } else if (category === 'suplementos') {
        payload.weight = formData.weight;
        payload.flavor = formData.flavor;
        payload.type = formData.type;
      } else if (category === 'maquinas') {
        payload.type = formData.type;
        payload.dimensions = formData.dimensions;
        payload.weight_capacity = formData.weight_capacity;
        payload.features = formData.features.split(',').map(f => f.trim());
      }

      let error;
      if (productToEdit) {
        const { error: updateError } = await supabase.from(category).update(payload).eq('id', productToEdit.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from(category).insert([payload]);
        error = insertError;
      }
      
      if (error) throw error;
      
      alert(productToEdit ? 'Producto actualizado correctamente' : 'Producto guardado correctamente');
      onSaved();
    } catch (err) {
      console.error(err);
      alert('Error al guardar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="admin-product-form">
      <div className="form-row">
        <div className="admin-form-group">
          <label>Nombre del Producto</label>
          <input name="name" required value={formData.name} onChange={handleChange} />
        </div>
        <div className="admin-form-group">
          <label>Slug (URL amigable)</label>
          <input name="slug" placeholder="ejemplo-producto" value={formData.slug} onChange={handleChange} />
        </div>
      </div>

      <div className="form-row">
        <div className="admin-form-group">
          <label>Precio ($)</label>
          <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleChange} />
        </div>
        <div className="admin-form-group">
          <label>Marca</label>
          <input name="brand" value={formData.brand} onChange={handleChange} />
        </div>
      </div>

      <div className="admin-form-group">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label>Descripción</label>
          <small style={{ color: formData.description.length >= 500 ? '#ff6b6b' : '#888', fontSize: '0.8rem' }}>
            {formData.description.length}/500
          </small>
        </div>
        <textarea 
          ref={textareaRef}
          name="description" 
          rows="3" 
          value={formData.description} 
          onChange={handleDescriptionChange}
          maxLength={500}
          style={{ overflow: 'hidden', resize: 'none' }}
        ></textarea>
      </div>

      {/* ROPA SPECIFIC */}
      {category === 'ropa' && (
        <div className="category-specific">
          <h4>Atributos de Ropa</h4>
          <div className="form-row">
            <div className="admin-form-group">
              <label>Género</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="Unisex">Unisex</option>
                <option value="Hombre">Hombre</option>
                <option value="Mujer">Mujer</option>
              </select>
            </div>
            <div className="admin-form-group">
              <label>Tallas (separadas por coma)</label>
              <input name="sizes" placeholder="S, M, L" value={formData.sizes} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="admin-form-group">
              <label>Colores (separados por coma)</label>
              <input name="colors" placeholder="Negro, Blanco" value={formData.colors} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label>Material</label>
              <input name="material" placeholder="100% Algodón" value={formData.material} onChange={handleChange} />
            </div>
          </div>
        </div>
      )}

      {/* SUPLEMENTOS SPECIFIC */}
      {category === 'suplementos' && (
        <div className="category-specific">
          <h4>Atributos de Suplemento</h4>
          <div className="form-row">
            <div className="admin-form-group">
              <label>Tipo</label>
              <input name="type" placeholder="Proteína, Creatina..." value={formData.type} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label>Sabor</label>
              <input name="flavor" placeholder="Vainilla, Sin Sabor" value={formData.flavor} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label>Peso/Contenido</label>
              <input name="weight" placeholder="1kg, 60 servicios" value={formData.weight} onChange={handleChange} />
            </div>
          </div>
        </div>
      )}

      {/* MAQUINAS SPECIFIC */}
      {category === 'maquinas' && (
        <div className="category-specific">
          <h4>Atributos de Máquina</h4>
          <div className="form-row">
            <div className="admin-form-group">
              <label>Tipo de Máquina</label>
              <input name="type" placeholder="Fuerza, Cardio, Rack..." value={formData.type} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label>Dimensiones</label>
              <input name="dimensions" placeholder="Largo x Ancho x Alto" value={formData.dimensions} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="admin-form-group">
              <label>Capacidad de Peso</label>
              <input name="weight_capacity" placeholder="ej. 300kg" value={formData.weight_capacity} onChange={handleChange} />
            </div>
            <div className="admin-form-group">
              <label>Características (separadas por coma)</label>
              <input name="features" placeholder="Poleas de aluminio, Pila 100kg..." value={formData.features} onChange={handleChange} />
            </div>
          </div>
        </div>
      )}

      <div className="admin-form-group">
        <label>Imágenes del Producto</label>
        <div className="admin-image-upload-container">
          
          <div className="admin-image-previews">
            {existingImages.map((url, index) => (
              <div key={index} className="admin-preview-item">
                <img src={url} alt={`Preview ${index}`} />
                <button type="button" className="admin-preview-delete" onClick={() => removeExistingImage(url)} title="Eliminar imagen">
                  <iconify-icon icon="mdi:close" style={{ fontSize: '16px' }}></iconify-icon>
                </button>
              </div>
            ))}
            {previewUrl && (
              <div className="admin-preview-item" style={{ border: '2px dashed #4a90e2' }}>
                <img src={previewUrl} alt="New Preview" />
                <button type="button" className="admin-preview-delete" onClick={() => { setImageFile(null); setPreviewUrl(null); }} title="Cancelar">
                  <iconify-icon icon="mdi:close" style={{ fontSize: '16px' }}></iconify-icon>
                </button>
              </div>
            )}
          </div>

          <div className="admin-file-input-wrapper">
            <label className="admin-file-btn">
              <iconify-icon icon="mdi:cloud-upload-outline" style={{ fontSize: '24px' }}></iconify-icon>
              <span>{imageFile ? 'Cambiar archivo seleccionado' : 'Seleccionar archivo...'}</span>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
        </div>
      </div>

      <div className="admin-form-actions">
        <button type="button" className="admin-logout-btn" onClick={onCancel} disabled={loading}>Cancelar</button>
        <button type="submit" className="admin-primary-btn" disabled={loading}>
          {loading ? 'Guardando...' : (productToEdit ? 'Actualizar Producto' : 'Guardar Producto')}
        </button>
      </div>
    </form>
  );
}
