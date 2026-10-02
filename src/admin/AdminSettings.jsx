import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { modalService } from '../lib/modalService.js';
import { toastService } from '../lib/toastService.js';
import './AdminSettings.css';
import './AdminCategorySettings.css';

export default function AdminSettings() {
  const [isCollageEnabled, setIsCollageEnabled] = useState(true);
  const [collageImages, setCollageImages] = useState([]);
  const [imageFit, setImageFit] = useState('cover'); // 'cover' or 'contain'
  
  // Auth state
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingAuth, setUpdatingAuth] = useState(false);

  // Drag state
  const [draggedItemIdx, setDraggedItemIdx] = useState(null);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Category images state
  const defaultCategoryImages = {
    ropa: '',
    suplementos: '',
    maquinas: '',
    asesoria: '',
    envios: ''
  };
  const [categoryImages, setCategoryImages] = useState(defaultCategoryImages);
  const [uploadingCategory, setUploadingCategory] = useState(null);
  const categoryInputRef = useRef(null);

  const MAX_IMAGES = 20;

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);

    // Fetch User Auth
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.email) {
      setEmail(userData.user.email);
    }

    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key_name', 'collage_settings')
      .maybeSingle();

    const { data: catData } = await supabase
      .from('app_config')
      .select('value')
      .eq('key_name', 'category_images')
      .maybeSingle();

    if (catData && catData.value) {
      setCategoryImages({ ...defaultCategoryImages, ...catData.value });
    }

    if (error) {
      console.error("Error loading config", error);
    }

    if (data && data.value) {
      setIsCollageEnabled(data.value.enabled !== false);
      setCollageImages(data.value.images || []);
      setImageFit(data.value.imageFit || 'cover');
    } else {
      // Default to what the site currently has
      const defaultImages = [
        '/ropa_category.jpg',
        '/suplementos_category.jpg',
        '/maquinas_category.jpg',
        '/asesoria_category.jpg',
        '/envios_category.jpg'
      ];
      setCollageImages(defaultImages);
      // We don't save default here to avoid unnecessary DB writes until they change something
    }
    setLoading(false);
  };

  const saveConfig = async (enabled, images, currentFit = imageFit) => {
    const valueObj = { enabled, images, imageFit: currentFit };
    
    // Check if row exists
    const { data: existing } = await supabase
      .from('app_config')
      .select('id')
      .eq('key_name', 'collage_settings')
      .maybeSingle();

    if (existing) {
      await supabase.from('app_config').update({ value: valueObj }).eq('key_name', 'collage_settings');
    } else {
      await supabase.from('app_config').insert({ key_name: 'collage_settings', value: valueObj });
    }
  };

  const saveCategoryImages = async (newCategories) => {
    const { data: existing } = await supabase
      .from('app_config')
      .select('id')
      .eq('key_name', 'category_images')
      .maybeSingle();

    if (existing) {
      await supabase.from('app_config').update({ value: newCategories }).eq('key_name', 'category_images');
    } else {
      await supabase.from('app_config').insert({ key_name: 'category_images', value: newCategories });
    }
  };

  const handleToggle = async (e) => {
    const checked = e.target.checked;
    setIsCollageEnabled(checked);
    await saveConfig(checked, collageImages, imageFit);
  };

  const handleFitToggle = async (e) => {
    const newFit = e.target.checked ? 'contain' : 'cover';
    setImageFit(newFit);
    await saveConfig(isCollageEnabled, collageImages, newFit);
    toastService.success('Ajuste de imagen actualizado.');
  };

  const uploadImageToR2 = async (file) => {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (collageImages.length >= MAX_IMAGES) {
      toastService.error(`No puedes subir más de ${MAX_IMAGES} imágenes.`);
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await uploadImageToR2(file);
      const updatedImages = [...collageImages, publicUrl];
      setCollageImages(updatedImages);
      await saveConfig(isCollageEnabled, updatedImages, imageFit);
      toastService.success('Imagen subida y guardada exitosamente.');
    } catch (error) {
      console.error(error);
      modalService.alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  const handleCategoryFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingCategory) return;

    setUploading(true);
    try {
      const publicUrl = await uploadImageToR2(file);
      const newCats = { ...categoryImages, [uploadingCategory]: publicUrl };
      setCategoryImages(newCats);
      await saveCategoryImages(newCats);
      toastService.success(`Imagen de ${uploadingCategory.toUpperCase()} guardada.`);
    } catch (error) {
      console.error(error);
      toastService.error('Error al subir imagen de categoría: ' + error.message);
    } finally {
      setUploading(false);
      setUploadingCategory(null);
      if (categoryInputRef.current) categoryInputRef.current.value = '';
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    if (await modalService.confirm('¿Estás seguro de eliminar esta imagen del collage de forma permanente?')) {
      const urlToRemove = collageImages[indexToRemove];
      const updatedImages = collageImages.filter((_, idx) => idx !== indexToRemove);
      
      // Update local state and DB first for snappy UI
      setCollageImages(updatedImages);
      await saveConfig(isCollageEnabled, updatedImages, imageFit);

      // Attempt to delete from R2
      try {
        await fetch('/api/delete-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrls: [urlToRemove] })
        });
      } catch (err) {
        console.error('Error deleting image from R2:', err);
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedItemIdx === null) return;
    if (draggedItemIdx === targetIndex) return;

    const newImages = [...collageImages];
    const draggedItem = newImages[draggedItemIdx];
    
    // Remove the dragged item
    newImages.splice(draggedItemIdx, 1);
    // Insert at the target index
    newImages.splice(targetIndex, 0, draggedItem);
    
    setCollageImages(newImages);
    setDraggedItemIdx(null);
    
    await saveConfig(isCollageEnabled, newImages, imageFit);
    toastService.success('Orden actualizado correctamente.');
  };

  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    if (!email) return toastService.error('El correo no puede estar vacío.');
    
    setUpdatingAuth(true);
    const updates = { email };
    if (newPassword) {
      updates.password = newPassword;
    }

    try {
      const { error } = await supabase.auth.updateUser(updates);
      if (error) throw error;
      
      toastService.success('Credenciales actualizadas correctamente.');
      setNewPassword(''); // Clear password field on success
    } catch (err) {
      console.error(err);
      toastService.error('Error al actualizar: ' + err.message);
    } finally {
      setUpdatingAuth(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', color: '#888' }}>Cargando ajustes...</div>;
  }

  return (
    <div className="admin-settings">
      <div className="settings-header">
        <h2>Ajustes Globales del Sitio</h2>
        <p>Configura secciones y funciones dinámicas del sitio público.</p>
      </div>

      <div className="settings-section">
        <div className="settings-section-head">
          <h3>Collage del Hero <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>({collageImages.length} / {MAX_IMAGES} Imágenes)</span></h3>
          <label className="settings-toggle">
            <input 
              type="checkbox" 
              checked={isCollageEnabled}
              onChange={handleToggle}
            />
            <span className="toggle-slider"></span>
            <span>{isCollageEnabled ? 'Activado' : 'Desactivado'}</span>
          </label>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '15px' }}>Modo de Visualización</h4>
            <span style={{ fontSize: '12px', color: '#888' }}>Elige cómo se adaptan las imágenes al marco.</span>
          </div>
          <label className="settings-toggle">
            <input 
              type="checkbox" 
              checked={imageFit === 'contain'}
              onChange={handleFitToggle}
            />
            <span className="toggle-slider"></span>
            <span>{imageFit === 'contain' ? 'Mostrar Completa' : 'Recortar para Llenar'}</span>
          </label>
        </div>

        <p className="settings-hint">Administra las imágenes que conforman el mosaico diagonal de la página principal. Los cambios se reflejarán instantáneamente en el sitio principal.</p>

        {isCollageEnabled && (
          <div className="settings-collage-manager">
            <div className="settings-upload-controls">
              <input 
                type="file" 
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <button 
                className="admin-primary-btn" 
                onClick={() => fileInputRef.current.click()}
                disabled={uploading || collageImages.length >= MAX_IMAGES}
              >
                {uploading ? 'Subiendo...' : '+ Subir Imagen'}
              </button>
            </div>

            <div className="settings-image-grid">
              {collageImages.map((src, idx) => (
                <div 
                  key={src + idx} 
                  className={`settings-image-card ${draggedItemIdx === idx ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, idx)}
                  title="Arrastra para reordenar"
                >
                  <div className="image-position-badge">{idx + 1}</div>
                  <img src={src} alt="Collage preview" />
                  <button type="button" className="settings-delete-img" onClick={() => handleRemoveImage(idx)} title="Eliminar">
                    <iconify-icon icon="mdi:delete-outline"></iconify-icon>
                  </button>
                </div>
              ))}
              {collageImages.length === 0 && (
                <div className="settings-empty">No hay imágenes. El collage mostrará un fondo oscuro.</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="settings-section-head">
          <h3>Tarjetas de Categorías</h3>
        </div>
        <p className="settings-hint">Personaliza las imágenes de las 5 tarjetas que aparecen debajo del Hero en la página principal.</p>
        
        <input 
          type="file" 
          accept="image/*"
          ref={categoryInputRef}
          onChange={handleCategoryFileChange}
          style={{ display: 'none' }}
        />

        <div className="settings-category-grid">
          {Object.keys(defaultCategoryImages).map(catKey => (
            <div key={catKey} className="settings-category-card">
              <div className="category-img-wrapper">
                {categoryImages[catKey] ? <img src={categoryImages[catKey]} alt={catKey} /> : <div style={{width: '100%', height: '100%', background: '#111'}}></div>}
              </div>
              <div className="category-info">
                <strong>{catKey.toUpperCase()}</strong>
                <button 
                  className="admin-secondary-btn"
                  onClick={() => {
                    setUploadingCategory(catKey);
                    categoryInputRef.current.click();
                  }}
                  disabled={uploading}
                >
                  {uploading && uploadingCategory === catKey ? 'Subiendo...' : 'Cambiar Imagen'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section auth-settings-section">
        <div className="section-header">
          <h3>Credenciales de Acceso</h3>
          <p>Actualiza tu correo electrónico de administrador o cambia tu contraseña.</p>
        </div>

        <form onSubmit={handleUpdateCredentials} className="auth-settings-form">
          <div className="admin-form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ejemplo.com"
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Nueva Contraseña <span className="label-optional">(Opcional)</span></label>
            <input 
              type="password" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Dejar en blanco para mantener la actual"
            />
          </div>

          <button 
            type="submit" 
            className="admin-primary-btn"
            disabled={updatingAuth}
            style={{ marginTop: '1rem' }}
          >
            {updatingAuth ? 'Actualizando...' : 'Actualizar Credenciales'}
          </button>
        </form>
      </div>
    </div>
  );
}
